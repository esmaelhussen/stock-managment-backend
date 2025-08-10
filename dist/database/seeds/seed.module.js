"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeedModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const seed_service_1 = require("./seed.service");
const user_entity_1 = require("../../entities/user.entity");
const role_entity_1 = require("../../entities/role.entity");
const permission_entity_1 = require("../../entities/permission.entity");
const user_role_entity_1 = require("../../entities/user-role.entity");
const role_permission_entity_1 = require("../../entities/role-permission.entity");
let SeedModule = class SeedModule {
};
exports.SeedModule = SeedModule;
exports.SeedModule = SeedModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ envFilePath: '.env' }),
            typeorm_1.TypeOrmModule.forRoot({
                type: 'postgres',
                host: process.env.DB_HOST,
                port: Number(process.env.DB_PORT),
                username: process.env.DB_USERNAME,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_DATABASE,
                entities: [user_entity_1.User, role_entity_1.Role, permission_entity_1.Permission, user_role_entity_1.UserRole, role_permission_entity_1.RolePermission],
                synchronize: true,
            }),
            typeorm_1.TypeOrmModule.forFeature([
                user_entity_1.User,
                role_entity_1.Role,
                permission_entity_1.Permission,
                user_role_entity_1.UserRole,
                role_permission_entity_1.RolePermission,
            ]),
        ],
        providers: [seed_service_1.SeedService],
    })
], SeedModule);
//# sourceMappingURL=seed.module.js.map