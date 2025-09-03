import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../../entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Category } from '../../entities/category.entity';
import { Unit } from '../../entities/unit.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Unit)
    private readonly unitRepository: Repository<Unit>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const { name, sku, price, categoryId, unitId, image } = createProductDto;

    const existingProduct = await this.productRepository.findOneBy({ sku });
    if (existingProduct) {
      throw new ConflictException('Product with this SKU already exists');
    }
    const existname = await this.productRepository.findOneBy({ name });
    if (existname) {
      throw new ConflictException('Product with this name already exists');
    }

    const category = await this.categoryRepository.findOneBy({
      id: categoryId,
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const unit = await this.unitRepository.findOneBy({ id: unitId });
    if (!unit) {
      throw new NotFoundException('Unit not found');
    }

    const product = this.productRepository.create({
      name,
      sku,
      category,
      unit,
      price,
      description: createProductDto.description,
      image: createProductDto.image, // Save the image path
    });

    console.log('Product to save:', product); // Debugging log
    return this.productRepository.save(product);
  }

  async findAll(): Promise<Product[]> {
    return this.productRepository.find();
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findOneBy({ id });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const product = await this.findOne(id);

    if (updateProductDto.categoryId) {
      const category = await this.categoryRepository.findOneBy({
        id: updateProductDto.categoryId,
      });
      if (!category) {
        throw new NotFoundException('Category not found');
      }
      product.category = category;
    }

    if (updateProductDto.unitId) {
      const unit = await this.unitRepository.findOneBy({
        id: updateProductDto.unitId,
      });
      if (!unit) {
        throw new NotFoundException('Unit not found');
      }
      product.unit = unit;
    }

    if (updateProductDto.image) {
      product.image = updateProductDto.image; // Update the image path
    }

    Object.assign(product, updateProductDto);
    console.log('Updated Product:', product); // Debugging log
    return this.productRepository.save(product);
  }

  async remove(id: string): Promise<void> {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
  }
}
