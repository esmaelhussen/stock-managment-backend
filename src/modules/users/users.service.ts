import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { User } from '../../entities/user.entity';
import { UserRole } from '../../entities/user-role.entity';
import { Role } from '../../entities/role.entity';
import { Warehouse } from '../../entities/warehouse.entity';
import { Shop } from 'src/entities/shop.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  async findOneByResetToken(token: string): Promise<User | null> {
    return await this.usersRepository.findOne({
      where: { resetPasswordToken: token },
    });
  }
  async changePassword(
    id: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const { oldPassword, newPassword } = changePasswordDto;
    const user = await this.usersRepository.findOne({
      where: { id },
      select: ['id', 'password'],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      throw new BadRequestException('Old password is incorrect');
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.usersRepository.update(id, { password: hashedPassword });
    return { message: 'Password changed successfully' };
  }
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(UserRole)
    private userRolesRepository: Repository<UserRole>,
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
    @InjectRepository(Warehouse)
    private warehouseRepository: Repository<Warehouse>,
    @InjectRepository(Shop)
    private shopRepository: Repository<Shop>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { roleIds, ...userData } = createUserDto;

    const existingUser = await this.usersRepository.findOne({
      where: [{ email: userData.email }, { phoneNumber: userData.phoneNumber }],
    });

    if (existingUser) {
      throw new ConflictException(
        'User with this email or phone number already exists',
      );
    }

    const roles = roleIds?.length
      ? await this.rolesRepository.find({ where: { id: In(roleIds) } })
      : [];

    const hasWarehouseRole = roles.some(
      (role) => role.name.toLowerCase() === 'warehouse',
    );

    const hasShopRole = roles.some(
      (role) => role.name.toLowerCase() === 'shop',
    );

    // Validate warehouseId for warehouse or shop roles
    if (hasWarehouseRole && !createUserDto.warehouseId) {
      throw new BadRequestException(
        'Warehouse ID is required for warehouse or shop role',
      );
    }

    // Validate warehouseId should not exist for non-warehouse/shop roles
    if (!hasWarehouseRole && !hasShopRole && createUserDto.warehouseId) {
      throw new BadRequestException(
        'Warehouse ID should not exist for non-warehouse/shop roles',
      );
    }

    // Validate shopId if user has shop role
    if (hasShopRole && !createUserDto.shopId) {
      throw new BadRequestException('Shop ID is required for shop role');
    }

    // Validate shopId should not exist for non-shop roles
    if (!hasShopRole && createUserDto.shopId) {
      throw new BadRequestException(
        'Shop ID should not exist for non-shop roles',
      );
    }

    // Optional: Validate that shop belongs to warehouse
    if (hasShopRole) {
      const shop = await this.shopRepository.findOne({
        where: { id: createUserDto.shopId },
        relations: ['warehouse'],
      });
    }

    const user = this.usersRepository.create(userData);
    const savedUser = await this.usersRepository.save(user);

    if (roleIds && roleIds.length > 0) {
      await this.assignRoles(savedUser.id, roleIds);
    }

    return this.findOne(savedUser.id);
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      relations: [
        'userRoles',
        'userRoles.role',
        'userRoles.role.rolePermissions',
      ],
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: [
        'userRoles',
        'userRoles.role',
        'userRoles.role.rolePermissions',
      ],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.usersRepository.findOne({
      where: { email },
      select: [
        'id',
        'email',
        'password',
        'firstName',
        'lastName',
        'isActive',
        'warehouseId',
        'shopId',
      ],
      relations: [
        'userRoles',
        'userRoles.role',
        'userRoles.role.rolePermissions',
      ],
    });

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const { roleIds, ...updateData } = updateUserDto;
    // Remove any relations from updateData
    if ('userRoles' in updateData) {
      delete (updateData as any).userRoles;
    }

    await this.findOne(id);

    if (updateData.phoneNumber) {
      const existingUser = await this.usersRepository.findOne({
        where: { phoneNumber: updateData.phoneNumber },
      });

      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('Phone number already in use');
      }
    }

    await this.usersRepository.update(id, updateData);

    if (roleIds !== undefined) {
      await this.userRolesRepository.delete({ userId: id });
      if (roleIds.length > 0) {
        await this.assignRoles(id, roleIds);
      }
    }

    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.usersRepository.remove(user);
  }

  async assignRoles(userId: string, roleIds: string[]): Promise<void> {
    const roles = await this.rolesRepository.find({
      where: { id: In(roleIds) },
    });

    if (roles.length !== roleIds.length) {
      throw new BadRequestException('One or more invalid role IDs');
    }

    const userRoles = roleIds.map((roleId) => {
      return this.userRolesRepository.create({
        userId,
        roleId,
      });
    });

    await this.userRolesRepository.save(userRoles);
  }

  async getUserPermissions(userId: string): Promise<string[]> {
    const user = await this.findOne(userId);
    const permissions = new Set<string>();

    user.userRoles.forEach((userRole) => {
      userRole.role.rolePermissions.forEach((rolePermission) => {
        permissions.add(rolePermission.permission.name);
      });
    });

    return Array.from(permissions);
  }

  async getWarehouse(warehouseId: string) {
    console.log(`Fetching warehouse with ID: ${warehouseId}`);

    const warehouse = await this.warehouseRepository.findOne({
      where: { id: warehouseId },
    }); // Removed unnecessary relations

    if (!warehouse) {
      console.error(`Warehouse with ID ${warehouseId} not found`);
      throw new NotFoundException(`Warehouse with ID ${warehouseId} not found`);
    }

    return warehouse;
  }
}
