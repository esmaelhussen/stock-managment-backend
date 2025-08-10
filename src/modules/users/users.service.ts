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
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(UserRole)
    private userRolesRepository: Repository<UserRole>,
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
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
      select: ['id', 'email', 'password', 'firstName', 'lastName', 'isActive'],
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
}
