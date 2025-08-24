import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Stock } from '../../entities/stock.entity';

@Injectable()
export class StockService {
  constructor(
    @InjectRepository(Stock)
    private readonly stockRepository: Repository<Stock>,
  ) {}

  findAll(warehouseId: string) {
    return this.stockRepository.find({
      where: { warehouse: { id: warehouseId } },
      relations: ['product', 'warehouse'],
    });
  }
}
