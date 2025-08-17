import { AppService } from './app.service';
import { UsersService } from './modules/users/users.service';
import { RolesService } from './modules/roles/roles.service';
import { PermissionsService } from './modules/permissions/permissions.service';
import { WarehousesService } from './modules/warehouses/warehouses.service';
import { CategoriesService } from './modules/categories/categories.service';
import { UnitsService } from './modules/units/units.service';
export declare class AppController {
    private readonly appService;
    private readonly usersService;
    private readonly rolesService;
    private readonly permissionsService;
    private readonly warehousesService;
    private readonly categoriesService;
    private readonly unitsService;
    constructor(appService: AppService, usersService: UsersService, rolesService: RolesService, permissionsService: PermissionsService, warehousesService: WarehousesService, categoriesService: CategoriesService, unitsService: UnitsService);
    getHello(): string;
    getDashboardStats(): Promise<{
        totalUsers: number;
        activeRoles: number;
        permissions: number;
        warehouses: number;
        categories: number;
        units: number;
        stockItems: number;
    }>;
}
