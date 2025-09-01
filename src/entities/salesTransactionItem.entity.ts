import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Product } from './product.entity';
import { SalesTransaction } from './salesTransaction.entity';

@Entity()
export class SalesTransactionItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => SalesTransaction, (transaction) => transaction.items, {
    nullable: false,
  })
  salesTransaction: SalesTransaction;

  @ManyToOne(() => Product, { nullable: false })
  product: Product;

  @Column('int')
  quantity: number;

  @Column('decimal', { precision: 12, scale: 2 })
  price: number;

  @Column('decimal', { precision: 12, scale: 2 })
  totalPrice: number;
}
