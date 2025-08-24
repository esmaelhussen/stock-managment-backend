import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  BeforeInsert,
  BeforeUpdate,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserRole } from './user-role.entity';
import { Warehouse } from './warehouse.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'middle_name', nullable: true })
  middleName: string;

  @Column({ name: 'last_name' })
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column({ name: 'phone_number', unique: true })
  phoneNumber: string;

  @Column({ nullable: true })
  address: string;

  @Column({ select: false })
  password: string;

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => Warehouse, { eager: true })
  @JoinColumn({ name: 'warehouse_id' })
  warehouse: Warehouse;

  @Column({ name: 'warehouse_id', nullable: true })
  warehouseId: string;

  @OneToMany(() => UserRole, (userRole) => userRole.user, { eager: true })
  userRoles: UserRole[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'reset_password_token', nullable: true })
  resetPasswordToken?: string;

  @Column({ name: 'reset_password_expires', type: 'timestamp', nullable: true })
  resetPasswordExpires?: Date;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password && !this.password.startsWith('$2b$')) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }

  async validatePassword(password: string): Promise<boolean> {
    return await bcrypt.compare(password, this.password);
  }
}
