import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Warehouse {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column()
  address: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: true })
  active: boolean;
}
