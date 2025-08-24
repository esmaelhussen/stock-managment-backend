import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../../entities/category.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async findAll() {
    return this.categoryRepository.find();
  }

  async findOne(id: string) {
    const cat = await this.categoryRepository.findOneBy({ id });
    if (!cat) throw new NotFoundException('Category not found.');
    return cat;
  }

  async create(data: Partial<Category>) {
    const existing = await this.categoryRepository.findOneBy({
      name: data.name,
    });
    if (existing)
      throw new ConflictException('A category with this name already exists.');
    const cat = this.categoryRepository.create(data);
    return this.categoryRepository.save(cat);
  }

  async update(id: string, data: Partial<Category>) {
    const cat = await this.findOne(id);
    return this.categoryRepository.update(id, data);
  }

  async remove(id: string) {
    const cat = await this.findOne(id);
    return this.categoryRepository.delete(id);
  }
}
