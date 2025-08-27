import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shop } from '../../entities/shop.entity';
import { WarehouseService } from '../warehouse/warehouse.service';

@Injectable()
export class ShopService {
  constructor(
    @InjectRepository(Shop)
    private readonly shopRepository: Repository<Shop>,
    private readonly warehouseService: WarehouseService,
  ) {}

  async findAll() {
    return this.shopRepository.find({ relations: ['warehouse'] });
  }

  async findOne(id: string) {
    const shop = await this.shopRepository.findOne({
      where: { id },
      relations: ['warehouse'],
    });
    if (!shop) {
      throw new NotFoundException('Shop not found.');
    }
    return shop;
  }

  async create(data: Partial<Shop>) {
    const existingShop = await this.shopRepository.findOneBy({
      name: data.name,
    });
    if (existingShop) {
      throw new ConflictException('A shop with this name already exists.');
    }

    const warehouseId = data.warehouseId;
    if (!warehouseId) {
      throw new NotFoundException('Warehouse ID is required.');
    }
    const warehouse = await this.warehouseService.findOne(warehouseId);
    if (!warehouse) {
      throw new NotFoundException('Associated warehouse not found.');
    }

    const shop = this.shopRepository.create({ ...data, warehouse });
    return this.shopRepository.save(shop);
  }

  async update(id: string, data: Partial<Shop>) {
    const existingShop = await this.shopRepository.findOneBy({
      name: data.name,
    });

    if (existingShop && existingShop.id !== id) {
      throw new ConflictException('A shop with this name already exists.');
    }

    const shop = await this.findOne(id);
    if (!shop) {
      throw new NotFoundException('Cannot update. Shop not found.');
    }
    return this.shopRepository.update(id, data);
  }

  async remove(id: string) {
    const shop = await this.findOne(id);
    if (!shop) {
      throw new NotFoundException('Cannot delete. Shop not found.');
    }
    return this.shopRepository.delete(id);
  }
}
