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

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  discountAmount: number;

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  discountPercent: number;

  @Column({
    type: 'enum',
    enum: ['fixed', 'percent', 'none'],
    default: 'none',
  })
  discountType: 'fixed' | 'percent' | 'none';

  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  finalPrice: number;
}
