import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Product } from './product.entity';
import { Warehouse } from './warehouse.entity';
import { Shop } from './shop.entity';

@Entity()
export class Stock {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Product, (product) => product.id)
  product: Product;

  @ManyToOne(() => Warehouse, { nullable: true, eager: true })
  warehouse?: Warehouse;

  @ManyToOne(() => Shop, { nullable: true, eager: true })
  shop?: Shop; // Added relationship to link stock to a shop

  @Column({ nullable: false })
  quantity: number;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @CreateDateColumn()
  timestamp: Date;
}
