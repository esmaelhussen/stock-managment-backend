import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Stock } from './stock.entity';
import { User } from './user.entity';
import { Warehouse } from './warehouse.entity';
import { Product } from './product.entity';
import { Shop } from './shop.entity';

// ✅ Declare TransactionType enum
export enum TransactionType {
  ADD = 'add',
  REMOVE = 'remove',
  TRANSFER = 'transfer',
}

@Entity()
export class StockTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Stock, { nullable: true })
  stock: Stock;

  // ✅ Source warehouse (where stock is removed)
  @ManyToOne(() => Warehouse, { nullable: true })
  sourceWarehouse: Warehouse;

  // ✅ Target warehouse (where stock is added)
  @ManyToOne(() => Warehouse, { nullable: true })
  targetWarehouse: Warehouse;

  @ManyToOne(() => Product)
  product: Product;

  @Column('int')
  quantity: number;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column({
    type: 'enum',
    enum: TransactionType,
  })
  type: TransactionType;

  @CreateDateColumn()
  timestamp: Date;

  @ManyToOne(() => User, { nullable: false })
  transactedBy: User;

  @ManyToOne(() => Shop, { nullable: true })
  shop: Shop;
}
