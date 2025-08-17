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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppController = void 0;
const common_1 = require("@nestjs/common");
const app_service_1 = require("./app.service");
const users_service_1 = require("./modules/users/users.service");
const roles_service_1 = require("./modules/roles/roles.service");
const permissions_service_1 = require("./modules/permissions/permissions.service");
const warehouses_service_1 = require("./modules/warehouses/warehouses.service");
const categories_service_1 = require("./modules/categories/categories.service");
const units_service_1 = require("./modules/units/units.service");
let AppController = class AppController {
    appService;
    usersService;
    rolesService;
    permissionsService;
    warehousesService;
    categoriesService;
    unitsService;
    constructor(appService, usersService, rolesService, permissionsService, warehousesService, categoriesService, unitsService) {
        this.appService = appService;
        this.usersService = usersService;
        this.rolesService = rolesService;
        this.permissionsService = permissionsService;
        this.warehousesService = warehousesService;
        this.categoriesService = categoriesService;
        this.unitsService = unitsService;
    }
    getHello() {
        return this.appService.getHello();
    }
    async getDashboardStats() {
        const [users, roles, permissions, warehouses, categories, units] = await Promise.all([
            this.usersService.findAll(),
            this.rolesService.findAll(),
            this.permissionsService.findAll(),
            this.warehousesService.findAll(),
            this.categoriesService.findAll(),
            this.unitsService.findAll(),
        ]);
        return {
            totalUsers: users.length,
            activeRoles: roles.length,
            permissions: permissions.length,
            warehouses: warehouses.length,
            categories: categories.length,
            units: units.length,
            stockItems: 0,
        };
    }
};
exports.AppController = AppController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", String)
], AppController.prototype, "getHello", null);
__decorate([
    (0, common_1.Get)('dashboard/stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AppController.prototype, "getDashboardStats", null);
exports.AppController = AppController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [app_service_1.AppService,
        users_service_1.UsersService,
        roles_service_1.RolesService,
        permissions_service_1.PermissionsService,
        warehouses_service_1.WarehousesService,
        categories_service_1.CategoriesService,
        units_service_1.UnitsService])
], AppController);
//# sourceMappingURL=app.controller.js.map