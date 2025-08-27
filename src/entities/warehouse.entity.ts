import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Shop } from './shop.entity';

@Entity()
export class Warehouse {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column()
  address: string;

  @Column({ nullable: true })
  description: string;

  @OneToMany(() => Shop, (shop) => shop.warehouse)
  shops: Shop[]; // Added relationship to link shops to a warehouse
}
