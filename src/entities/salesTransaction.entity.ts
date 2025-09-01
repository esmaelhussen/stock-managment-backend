import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { Shop } from './shop.entity';
import { SalesTransactionItem } from './salesTransactionItem.entity';

export enum PaymentMethod {
  TELEBIRR = 'telebirr',
  CBE = 'cbe',
  AWASH = 'awash',
  EBIRR = 'e-birr',
  CREDIT = 'credit',
}

@Entity()
export class SalesTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Shop, { nullable: false })
  shop: Shop;

  @Column({ type: 'enum', enum: PaymentMethod })
  paymentMethod: PaymentMethod;

  @Column({ nullable: true })
  creditorName?: string;

  @Column('decimal', { precision: 12, scale: 2 })
  totalPrice: number;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => SalesTransactionItem, (item) => item.salesTransaction, {
    cascade: true,
  })
  items: SalesTransactionItem[];
}
