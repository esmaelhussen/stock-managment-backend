import { AppService } from './app.service';
import { UsersService } from './modules/users/users.service';
import { RolesService } from './modules/roles/roles.service';
import { PermissionsService } from './modules/permissions/permissions.service';
import { WarehouseService } from './modules/warehouse/warehouse.service';
import { CategoriesService } from './modules/categories/categories.service';
import { UnitsService } from './modules/units/units.service';
import { ProductsService } from './modules/products/products.service';
export declare class AppController {
    private readonly appService;
    private readonly usersService;
    private readonly rolesService;
    private readonly permissionsService;
    private readonly warehouseService;
    private readonly categoriesService;
    private readonly unitsService;
    private readonly productsService;
    constructor(appService: AppService, usersService: UsersService, rolesService: RolesService, permissionsService: PermissionsService, warehouseService: WarehouseService, categoriesService: CategoriesService, unitsService: UnitsService, productsService: ProductsService);
    getHello(): string;
    getDashboardStats(): Promise<{
        totalUsers: number;
        activeRoles: number;
        permissions: number;
        warehouses: number;
        categories: number;
        units: number;
        products: number;
    }>;
}
