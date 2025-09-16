import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { Shop } from './shop.entity';
import { SalesTransactionItem } from './salesTransactionItem.entity';
import { Warehouse } from './warehouse.entity';
import { User } from './user.entity';
import { Customer } from './customer.entity';

export enum PaymentMethod {
  TELEBIRR = 'telebirr',
  CBE = 'cbe',
  AWASH = 'awash',
  EBIRR = 'e-birr',
  CREDIT = 'credit',
}

export enum CustomerType {
  WALK_IN = 'Walk-In',
  REGULAR = 'Regular',
}

@Entity()
export class SalesTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Shop, { nullable: true })
  shop: Shop;

  @ManyToOne(() => Warehouse, { nullable: true })
  warehouse: Warehouse;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
    nullable: true,
  })
  paymentMethod: PaymentMethod | null;

  @Column({ nullable: true })
  creditorName?: string;

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

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => SalesTransactionItem, (item) => item.salesTransaction, {
    cascade: true,
  })
  items: SalesTransactionItem[];

  @Column({ type: 'enum', enum: ['unpayed', 'payed'], default: 'unpayed' })
  status: 'unpayed' | 'payed';

  @ManyToOne(() => User, { nullable: true })
  transactedBy: User;

  @ManyToOne(() => Customer, (customer) => customer.transactions, {
    nullable: true,
  })
  customer: Customer;

  @Column({
    type: 'enum',
    enum: CustomerType,
    default: CustomerType.WALK_IN,
  })
  customerType: CustomerType;

  @BeforeInsert()
  @BeforeUpdate()
  validatePaymentMethod() {
    if (this.paymentMethod !== PaymentMethod.CREDIT) {
      this.status = 'payed';
    }
  }

  @BeforeInsert()
  @BeforeUpdate()
  validateLocation() {
    if (!this.shop && !this.warehouse) {
      throw new Error('Either shop or warehouse must be provided.');
    }
  }
}
