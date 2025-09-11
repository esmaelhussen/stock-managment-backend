import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../../entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto'; // Import the DTO

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async findAll() {
    const categories = await this.categoryRepository.find({
      relations: ['subcategories', 'parentCategory'],
    });
    return categories.map((category) => ({
      ...category,
      parentCategoryId: category.parentCategory?.id || null,
    }));
  }

  async findOne(id: string) {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['subcategories', 'parentCategory'],
    });
    if (!category) throw new NotFoundException('Category not found.');
    return {
      ...category,
      parentCategoryId: category.parentCategory?.id || null,
    };
  }

  async create(data: CreateCategoryDto) {
    const existing = await this.categoryRepository.findOneBy({
      name: data.name,
    });
    if (existing) {
      throw new ConflictException('A category with this name already exists.');
    }

    let parentCategory: Category | null = null;
    if (data.parentCategoryId) {
      parentCategory = await this.categoryRepository.findOneBy({
        id: data.parentCategoryId,
      });
      if (!parentCategory) {
        throw new NotFoundException('Parent category not found.');
      }
    }

    const cat = this.categoryRepository.create({
      ...data,
      parentCategory: parentCategory || undefined, // Ensure proper type assignment
    });
    return this.categoryRepository.save(cat);
  }

  async update(id: string, data: Partial<Category & { parentCategoryId?: string }>) {
    const cat = await this.findOne(id);

    let parentCategory: Category | null = null;
    if (data.parentCategoryId) {
      parentCategory = await this.categoryRepository.findOneBy({
        id: data.parentCategoryId,
      });
      if (!parentCategory) {
        throw new NotFoundException('Parent category not found.');
      }
    }

    if (data.parentCategoryId && cat.subcategories && cat.subcategories.length > 0) {
      throw new ConflictException(
        'Parent category must update if not have subcategory.',
      );
    }

    // Remove parentCategoryId from the data object to avoid passing it to the repository
    const { parentCategoryId, ...updateData } = data;

    return this.categoryRepository.update(id, {
      ...updateData,
      parentCategory: parentCategory || undefined,
    });
  }

  async remove(id: string) {
    const cat = await this.categoryRepository.findOne({
      where: { id },
      relations: ['subcategories'],
    });

    if (!cat) {
      throw new NotFoundException('Category not found.');
    }

    console.log('Category to delete:', cat);

    if (cat.subcategories && cat.subcategories.length > 0) {
      throw new ConflictException(
        'Cannot delete a category that has subcategories. First delete or reassign its subcategories.',
      );
    }

    return this.categoryRepository.delete(id);
  }
}
