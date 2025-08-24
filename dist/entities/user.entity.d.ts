import { UserRole } from './user-role.entity';
import { Warehouse } from './warehouse.entity';
export declare class User {
    id: string;
    firstName: string;
    middleName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    address: string;
    password: string;
    isActive: boolean;
    warehouse: Warehouse;
    warehouseId: string;
    userRoles: UserRole[];
    createdAt: Date;
    updatedAt: Date;
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
    hashPassword(): Promise<void>;
    validatePassword(password: string): Promise<boolean>;
}
