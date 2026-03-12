import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Warehouse } from '../../entities/warehouse.entity';

@Injectable()
export class WarehouseService {
  constructor(
    @InjectRepository(Warehouse)
    private readonly warehouseRepository: Repository<Warehouse>,
  ) {}

  async findAll() {
    return this.warehouseRepository.find();
  }

  async findOne(id: string) {
    const warehouse = await this.warehouseRepository.findOneBy({ id });
    if (!warehouse) {
      throw new NotFoundException('Warehouse not found.');
    }
    return warehouse;
  }

  async create(data: Partial<Warehouse>) {
    const existingWarehouse = await this.warehouseRepository.findOneBy({
      name: data.name,
    });
    if (existingWarehouse) {
      throw new ConflictException('A warehouse with this name already exists.');
    }
    const warehouse = this.warehouseRepository.create(data);
    return this.warehouseRepository.save(warehouse);
  }

  async update(id: string, data: Partial<Warehouse>) {
    const warehouse = await this.findOne(id);
    if (!warehouse) {
      throw new NotFoundException('Cannot update. Warehouse not found.');
    }
    return this.warehouseRepository.update(id, data);
  }

  async remove(id: string) {
    const warehouse = await this.findOne(id);
    if (!warehouse) {
      throw new NotFoundException('Cannot delete. Warehouse not found.');
    }
    return this.warehouseRepository.delete(id);
  }

  // async getShopsInWarehouse(id: string) {
  //   const warehouse = await this.warehouseRepository.findOne({
  //     where: { id },
  //     relations: ['shops'],
  //   });
  //
  //   if (!warehouse) {
  //     throw new NotFoundException('Warehouse not found.');
  //   }
  //
  //   return warehouse.shops;
  // }
}
