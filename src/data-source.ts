import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
// import { User } from './entities/user.entity';
// import { Role } from './entities/role.entity';
// import { Permission } from './entities/permission.entity';
// import { UserRole } from './entities/user-role.entity';
// import { RolePermission } from './entities/role-permission.entity';

dotenv.config({ path: '.env' });

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'postgres',
  entities: [__dirname + '/entities/*{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: false,
  // ssl: { rejectUnauthorized: false },
});

// Keep a single export of the DataSource (named). TypeORM CLI expects exactly one DataSource export.
