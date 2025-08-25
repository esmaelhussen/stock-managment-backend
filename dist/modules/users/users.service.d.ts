import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { UserRole } from '../../entities/user-role.entity';
import { Role } from '../../entities/role.entity';
import { Warehouse } from '../../entities/warehouse.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
export declare class UsersService {
    private usersRepository;
    private userRolesRepository;
    private rolesRepository;
    private warehouseRepository;
    findOneByResetToken(token: string): Promise<User | null>;
    changePassword(id: string, changePasswordDto: ChangePasswordDto): Promise<{
        message: string;
    }>;
    constructor(usersRepository: Repository<User>, userRolesRepository: Repository<UserRole>, rolesRepository: Repository<Role>, warehouseRepository: Repository<Warehouse>);
    create(createUserDto: CreateUserDto): Promise<User>;
    findAll(): Promise<User[]>;
    findOne(id: string): Promise<User>;
    findByEmail(email: string): Promise<User | null>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<User>;
    remove(id: string): Promise<void>;
    assignRoles(userId: string, roleIds: string[]): Promise<void>;
    getUserPermissions(userId: string): Promise<string[]>;
    getWarehouse(warehouseId: string): Promise<Warehouse>;
}
