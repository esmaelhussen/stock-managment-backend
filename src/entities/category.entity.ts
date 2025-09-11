import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';

@Entity()
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  identifier?: string;

  @ManyToOne(() => Category, (category) => category.subcategories, { nullable: true })
  parentCategory: Category;

  @OneToMany(() => Category, (category) => category.parentCategory)
  subcategories: Category[];
}
