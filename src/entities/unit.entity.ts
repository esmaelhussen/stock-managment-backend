import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Unit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;
}
