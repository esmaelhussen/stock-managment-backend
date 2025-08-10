"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const permission_entity_1 = require("../../entities/permission.entity");
let PermissionsService = class PermissionsService {
    permissionsRepository;
    constructor(permissionsRepository) {
        this.permissionsRepository = permissionsRepository;
    }
    async create(createPermissionDto) {
        const existingPermission = await this.permissionsRepository.findOne({
            where: { name: createPermissionDto.name },
        });
        if (existingPermission) {
            throw new common_1.ConflictException('Permission with this name already exists');
        }
        const permission = this.permissionsRepository.create(createPermissionDto);
        return this.permissionsRepository.save(permission);
    }
    async findAll() {
        return this.permissionsRepository.find();
    }
    async findOne(id) {
        const permission = await this.permissionsRepository.findOne({
            where: { id },
        });
        if (!permission) {
            throw new common_1.NotFoundException(`Permission with ID ${id} not found`);
        }
        return permission;
    }
    async update(id, updatePermissionDto) {
        const permission = await this.findOne(id);
        if (updatePermissionDto.name) {
            const existingPermission = await this.permissionsRepository.findOne({
                where: { name: updatePermissionDto.name },
            });
            if (existingPermission && existingPermission.id !== id) {
                throw new common_1.ConflictException('Permission name already in use');
            }
        }
        await this.permissionsRepository.update(id, updatePermissionDto);
        return this.findOne(id);
    }
    async remove(id) {
        const permission = await this.findOne(id);
        await this.permissionsRepository.remove(permission);
    }
    async findByResource(resource) {
        return this.permissionsRepository.find({
            where: { resource },
        });
    }
};
exports.PermissionsService = PermissionsService;
exports.PermissionsService = PermissionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(permission_entity_1.Permission)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], PermissionsService);
//# sourceMappingURL=permissions.service.js.map