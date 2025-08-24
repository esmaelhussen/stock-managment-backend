"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../../entities/user.entity");
const user_role_entity_1 = require("../../entities/user-role.entity");
const role_entity_1 = require("../../entities/role.entity");
const bcrypt = __importStar(require("bcrypt"));
let UsersService = class UsersService {
    usersRepository;
    userRolesRepository;
    rolesRepository;
    async findOneByResetToken(token) {
        return await this.usersRepository.findOne({
            where: { resetPasswordToken: token },
        });
    }
    async changePassword(id, changePasswordDto) {
        const { oldPassword, newPassword } = changePasswordDto;
        const user = await this.usersRepository.findOne({
            where: { id },
            select: ['id', 'password'],
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            throw new common_1.BadRequestException('Old password is incorrect');
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await this.usersRepository.update(id, { password: hashedPassword });
        return { message: 'Password changed successfully' };
    }
    constructor(usersRepository, userRolesRepository, rolesRepository) {
        this.usersRepository = usersRepository;
        this.userRolesRepository = userRolesRepository;
        this.rolesRepository = rolesRepository;
    }
    async create(createUserDto) {
        const { roleIds, ...userData } = createUserDto;
        const existingUser = await this.usersRepository.findOne({
            where: [{ email: userData.email }, { phoneNumber: userData.phoneNumber }],
        });
        if (existingUser) {
            throw new common_1.ConflictException('User with this email or phone number already exists');
        }
        const user = this.usersRepository.create(userData);
        const savedUser = await this.usersRepository.save(user);
        if (roleIds && roleIds.length > 0) {
            await this.assignRoles(savedUser.id, roleIds);
        }
        return this.findOne(savedUser.id);
    }
    async findAll() {
        return this.usersRepository.find({
            relations: [
                'userRoles',
                'userRoles.role',
                'userRoles.role.rolePermissions',
            ],
        });
    }
    async findOne(id) {
        const user = await this.usersRepository.findOne({
            where: { id },
            relations: [
                'userRoles',
                'userRoles.role',
                'userRoles.role.rolePermissions',
            ],
        });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
        }
        return user;
    }
    async findByEmail(email) {
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
    async update(id, updateUserDto) {
        const { roleIds, ...updateData } = updateUserDto;
        if ('userRoles' in updateData) {
            delete updateData.userRoles;
        }
        await this.findOne(id);
        if (updateData.phoneNumber) {
            const existingUser = await this.usersRepository.findOne({
                where: { phoneNumber: updateData.phoneNumber },
            });
            if (existingUser && existingUser.id !== id) {
                throw new common_1.ConflictException('Phone number already in use');
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
    async remove(id) {
        const user = await this.findOne(id);
        await this.usersRepository.remove(user);
    }
    async assignRoles(userId, roleIds) {
        const roles = await this.rolesRepository.find({
            where: { id: (0, typeorm_2.In)(roleIds) },
        });
        if (roles.length !== roleIds.length) {
            throw new common_1.BadRequestException('One or more invalid role IDs');
        }
        const userRoles = roleIds.map((roleId) => {
            return this.userRolesRepository.create({
                userId,
                roleId,
            });
        });
        await this.userRolesRepository.save(userRoles);
    }
    async getUserPermissions(userId) {
        const user = await this.findOne(userId);
        const permissions = new Set();
        user.userRoles.forEach((userRole) => {
            userRole.role.rolePermissions.forEach((rolePermission) => {
                permissions.add(rolePermission.permission.name);
            });
        });
        return Array.from(permissions);
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(user_role_entity_1.UserRole)),
    __param(2, (0, typeorm_1.InjectRepository)(role_entity_1.Role)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], UsersService);
//# sourceMappingURL=users.service.js.map