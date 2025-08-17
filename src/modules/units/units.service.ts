import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Unit } from '../../entities/unit.entity';
import { CreateUnitDto, UpdateUnitDto } from './dto';

@Injectable()
export class UnitsService {
  constructor(
    @InjectRepository(Unit)
    private readonly unitRepository: Repository<Unit>,
  ) {}

  create(dto: CreateUnitDto) {
    const unit = this.unitRepository.create(dto);
    return this.unitRepository.save(unit);
  }

  findAll() {
    return this.unitRepository.find();
  }

  findOne(id: number) {
    return this.unitRepository.findOne({ where: { id } });
  }

  update(id: number, dto: UpdateUnitDto) {
    return this.unitRepository.update(id, dto);
  }

  remove(id: number) {
    return this.unitRepository.delete(id);
  }
}
