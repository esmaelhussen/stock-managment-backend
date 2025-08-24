import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

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
}
