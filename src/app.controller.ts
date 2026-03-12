import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { UsersService } from './modules/users/users.service';
import { RolesService } from './modules/roles/roles.service';
import { PermissionsService } from './modules/permissions/permissions.service';
import { WarehouseService } from './modules/warehouse/warehouse.service';
import { CategoriesService } from './modules/categories/categories.service';
import { UnitsService } from './modules/units/units.service';
import { ProductsService } from './modules/products/products.service';
import { ShopService } from './modules/shop/shop.service';
import { BrandsService } from './modules/brands/brands.service';
import { CustomerService } from './modules/customers/customer.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly usersService: UsersService,
    private readonly rolesService: RolesService,
    private readonly permissionsService: PermissionsService,
    private readonly warehouseService: WarehouseService,
    private readonly categoriesService: CategoriesService,
    private readonly unitsService: UnitsService,
    private readonly productsService: ProductsService,
    private readonly shopService: ShopService,
    private readonly brandService: BrandsService,
    private readonly customerService: CustomerService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('dashboard/stats')
  async getDashboardStats() {
    const [
      users,
      roles,
      permissions,
      warehouses,
      categories,
      units,
      products,
      shops,
      brands,
      customers,
    ] = await Promise.all([
      this.usersService.findAll(),
      this.rolesService.findAll(),
      this.permissionsService.findAll(),
      this.warehouseService.findAll(),
      this.categoriesService.findAll(),
      this.unitsService.findAll(),
      this.productsService.findAll(),
      this.shopService.findAll(),
      this.brandService.findAll(),
      this.customerService.findAll(), // Fetch customers
    ]);
    // TODO: Add stock items count when implemented
    return {
      totalUsers: users.length,
      activeRoles: roles.length,
      permissions: permissions.length,
      warehouses: warehouses.length,
      categories: categories.length,
      units: units.length,
      products: products.length,
      shops: shops.length,
      brands: brands.length,
      customers: customers.length, // Return customers count
    };
  }
}
