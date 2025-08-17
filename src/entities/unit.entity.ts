import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Unit {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column()
  abbreviation: string;

  @Column({ default: true })
  active: boolean;
}
