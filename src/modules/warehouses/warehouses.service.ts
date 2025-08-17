import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Warehouse } from '../../entities/warehouse.entity';
import { CreateWarehouseDto, UpdateWarehouseDto } from './dto';

@Injectable()
export class WarehousesService {
  constructor(
    @InjectRepository(Warehouse)
    private readonly warehouseRepository: Repository<Warehouse>,
  ) {}

  create(dto: CreateWarehouseDto) {
    const warehouse = this.warehouseRepository.create(dto);
    return this.warehouseRepository.save(warehouse);
  }

  findAll() {
    return this.warehouseRepository.find();
  }

  findOne(id: number) {
    return this.warehouseRepository.findOne({ where: { id } });
  }

  update(id: number, dto: UpdateWarehouseDto) {
    return this.warehouseRepository.update(id, dto);
  }

  remove(id: number) {
    return this.warehouseRepository.delete(id);
  }
}
