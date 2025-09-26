import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../../entities/role.entity';
import { Permission } from '../../entities/permission.entity';
import { RolePermission } from '../../entities/role-permission.entity';
import { User } from '../../entities/user.entity';
import { UserRole } from '../../entities/user-role.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
    @InjectRepository(Permission)
    private permissionsRepository: Repository<Permission>,
    @InjectRepository(RolePermission)
    private rolePermissionsRepository: Repository<RolePermission>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(UserRole)
    private userRolesRepository: Repository<UserRole>,
  ) {}

  async seed() {
    await this.seedPermissions();
    await this.seedRoles();
    await this.seedAdminUser();
  }

  private async seedPermissions() {
    const permissions = [
      // User permissions
      {
        name: 'users.create',
        description: 'Create users',
        resource: 'users',
        action: 'create',
      },
      {
        name: 'users.read',
        description: 'View users',
        resource: 'users',
        action: 'read',
      },
      {
        name: 'users.update',
        description: 'Update users',
        resource: 'users',
        action: 'update',
      },
      {
        name: 'users.delete',
        description: 'Delete users',
        resource: 'users',
        action: 'delete',
      },

      // Role permissions
      {
        name: 'roles.create',
        description: 'Create roles',
        resource: 'roles',
        action: 'create',
      },
      {
        name: 'roles.read',
        description: 'View roles',
        resource: 'roles',
        action: 'read',
      },
      {
        name: 'roles.update',
        description: 'Update roles',
        resource: 'roles',
        action: 'update',
      },
      {
        name: 'roles.delete',
        description: 'Delete roles',
        resource: 'roles',
        action: 'delete',
      },

      // Permission permissions
      {
        name: 'permissions.create',
        description: 'Create permissions',
        resource: 'permissions',
        action: 'create',
      },
      {
        name: 'permissions.read',
        description: 'View permissions',
        resource: 'permissions',
        action: 'read',
      },
      {
        name: 'permissions.update',
        description: 'Update permissions',
        resource: 'permissions',
        action: 'update',
      },
      {
        name: 'permissions.delete',
        description: 'Delete permissions',
        resource: 'permissions',
        action: 'delete',
      },

      // Stock permissions (for future use)
      {
        name: 'stock.create',
        description: 'Create stock items',
        resource: 'stock',
        action: 'create',
      },
      {
        name: 'stock.read',
        description: 'View stock items',
        resource: 'stock',
        action: 'read',
      },
      {
        name: 'stock.update',
        description: 'Update stock items',
        resource: 'stock',
        action: 'update',
      },
      {
        name: 'stock.delete',
        description: 'Delete stock items',
        resource: 'stock',
        action: 'delete',
      },
      // dashboard permissions (for future use)
      {
        name: 'dashboards.read',
        description: 'view dashboard',
        resource: 'dashboard',
        action: 'read',
      },

      // warehouse permissions (for future use)
      {
        name: 'warehouses.create',
        description: 'Create warehouse',
        resource: 'warehouses',
        action: 'create',
      },
      {
        name: 'warehouses.read',
        description: 'View warehouse ',
        resource: 'warehouses',
        action: 'read',
      },
      {
        name: 'warehouses.update',
        description: 'Update warehouse',
        resource: 'warehouses',
        action: 'update',
      },
      {
        name: 'warehouses.delete',
        description: 'delete warehouse',
        resource: 'warehouses',
        action: 'delete',
      },

      // categories permissions (for future use)
      {
        name: 'categories.create',
        description: 'Create category',
        resource: 'categories',
        action: 'create',
      },
      {
        name: 'categories.read',
        description: 'View category',
        resource: 'categories',
        action: 'read',
      },
      {
        name: 'categories.update',
        description: 'Update category',
        resource: 'categories',
        action: 'update',
      },
      {
        name: 'categories.delete',
        description: 'delete category',
        resource: 'categories',
        action: 'delete',
      },

      // units permissions (for future use)
      {
        name: 'units.create',
        description: 'Create unit',
        resource: 'units',
        action: 'create',
      },
      {
        name: 'units.read',
        description: 'View unit',
        resource: 'units',
        action: 'read',
      },
      {
        name: 'units.update',
        description: 'Update unit',
        resource: 'units',
        action: 'update',
      },
      {
        name: 'units.delete',
        description: 'delete unit',
        resource: 'units',
        action: 'delete',
      },

      // product permissions (for future use)
      {
        name: 'products.create',
        description: 'Create product',
        resource: 'products',
        action: 'create',
      },
      {
        name: 'products.read',
        description: 'View product',
        resource: 'products',
        action: 'read',
      },
      {
        name: 'products.update',
        description: 'Update product',
        resource: 'products',
        action: 'update',
      },
      {
        name: 'products.delete',
        description: 'delete product',
        resource: 'products',
        action: 'delete',
      },

      // shop permissions (for future use)
      {
        name: 'shops.create',
        description: 'Create shop',
        resource: 'shops',
        action: 'create',
      },
      {
        name: 'shops.read',
        description: 'View shop',
        resource: 'shops',
        action: 'read',
      },
      {
        name: 'shops.update',
        description: 'Update shop',
        resource: 'shops',
        action: 'update',
      },
      {
        name: 'shops.delete',
        description: 'delete shop',
        resource: 'shops',
        action: 'delete',
      },

      // sales permissions (for future use)
      {
        name: 'sales.create',
        description: 'Create sale',
        resource: 'sales',
        action: 'create',
      },
      {
        name: 'sales.read',
        description: 'View sale',
        resource: 'sales',
        action: 'read',
      },
      {
        name: 'sales.update',
        description: 'Update sale',
        resource: 'sales',
        action: 'update',
      },
      {
        name: 'sales.delete',
        description: 'delete sale',
        resource: 'sales',
        action: 'delete',
      },

      // brands permissions (for future use)
      {
        name: 'brands.create',
        description: 'Create brands',
        resource: 'brands',
        action: 'create',
      },
      {
        name: 'brands.read',
        description: 'View brands',
        resource: 'brands',
        action: 'read',
      },
      {
        name: 'brands.update',
        description: 'Update brands',
        resource: 'brands',
        action: 'update',
      },
      {
        name: 'brands.delete',
        description: 'delete brands',
        resource: 'brands',
        action: 'delete',
      },

      // customers permissions (for future use)
      {
        name: 'customers.create',
        description: 'Create customers',
        resource: 'customers',
        action: 'create',
      },
      {
        name: 'customers.read',
        description: 'View customers',
        resource: 'customers',
        action: 'read',
      },
      {
        name: 'customers.update',
        description: 'Update customers',
        resource: 'customers',
        action: 'update',
      },
      {
        name: 'customers.delete',
        description: 'delete customers',
        resource: 'customers',
        action: 'delete',
      },
    ];

    for (const permission of permissions) {
      const existingPermission = await this.permissionsRepository.findOne({
        where: { name: permission.name },
      });

      if (!existingPermission) {
        await this.permissionsRepository.save(
          this.permissionsRepository.create(permission),
        );
      }
    }

    console.log('Permissions seeded successfully');
  }

  private async seedRoles() {
    const rolesData = [
      {
        name: 'Admin',
        description: 'Full system access',
        permissions: [
          'users.create',
          'users.read',
          'users.update',
          'users.delete',
          'roles.create',
          'roles.read',
          'roles.update',
          'roles.delete',
          'permissions.create',
          'permissions.read',
          'permissions.update',
          'permissions.delete',
          'stock.create',
          'stock.read',
          'stock.update',
          'stock.delete',
          'dashboards.read',
          'warehouses.create',
          'warehouses.read',
          'warehouses.update',
          'warehouses.delete',
          'categories.create',
          'categories.read',
          'categories.update',
          'categories.delete',
          'units.create',
          'units.read',
          'units.update',
          'units.delete',
          'products.create',
          'products.read',
          'products.update',
          'products.delete',
          'shops.create',
          'shops.read',
          'shops.update',
          'shops.delete',
          'sales.create',
          'sales.read',
          'sales.update',
          'sales.delete',
          'brands.create',
          'brands.read',
          'brands.update',
          'brands.delete',
          'customers.create',
          'customers.read',
          'customers.update',
          'customers.delete',
        ],
      },
      {
        name: 'Manager',
        description: 'Manage users and stock',
        permissions: [
          'users.read',
          'users.update',
          'roles.read',
          'permissions.read',
          'stock.create',
          'stock.read',
          'stock.update',
          'stock.delete',
        ],
      },
      {
        name: 'Staff',
        description: 'Basic user with limited access',
        permissions: ['users.read', 'stock.read', 'stock.update'],
      },
    ];

    for (const roleData of rolesData) {
      let role = await this.rolesRepository.findOne({
        where: { name: roleData.name },
      });

      if (!role) {
        role = await this.rolesRepository.save(
          this.rolesRepository.create({
            name: roleData.name,
            description: roleData.description,
          }),
        );

        // Assign permissions to role
        for (const permissionName of roleData.permissions) {
          const permission = await this.permissionsRepository.findOne({
            where: { name: permissionName },
          });

          if (permission) {
            await this.rolePermissionsRepository.save(
              this.rolePermissionsRepository.create({
                roleId: role.id,
                permissionId: permission.id,
              }),
            );
          }
        }
      }
    }

    console.log('Roles seeded successfully');
  }

  private async seedAdminUser() {
    const adminEmail = 'admin@example.com';
    const existingAdmin = await this.usersRepository.findOne({
      where: { email: adminEmail },
    });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);

      const admin = await this.usersRepository.save(
        this.usersRepository.create({
          firstName: 'System',
          lastName: 'Administrator',
          email: adminEmail,
          phoneNumber: '+1234567890',
          address: '123 Admin Street',
          password: hashedPassword,
          isActive: true,
        }),
      );

      // Assign Admin role
      const adminRole = await this.rolesRepository.findOne({
        where: { name: 'Admin' },
      });

      if (adminRole) {
        await this.userRolesRepository.save(
          this.userRolesRepository.create({
            userId: admin.id,
            roleId: adminRole.id,
          }),
        );
      }

      console.log('Admin user created successfully');
      console.log('Email: admin@example.com');
      console.log('Password: admin123');
    }
  }
}
