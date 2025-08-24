import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Unit } from '../../entities/unit.entity';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';

@Injectable()
export class UnitsService {
  constructor(
    @InjectRepository(Unit)
    private readonly unitRepository: Repository<Unit>,
  ) {}

  async create(createUnitDto: CreateUnitDto): Promise<Unit> {
    const existingUnit = await this.unitRepository.findOneBy({
      name: createUnitDto.name,
    });
    if (existingUnit) {
      throw new ConflictException('Unit with this name already exists');
    }
    const unit = this.unitRepository.create(createUnitDto);
    return this.unitRepository.save(unit);
  }

  async findAll(): Promise<Unit[]> {
    return this.unitRepository.find();
  }

  async findOne(id: string): Promise<Unit> {
    const unit = await this.unitRepository.findOneBy({ id });
    if (!unit) {
      throw new NotFoundException('Unit not found');
    }
    return unit;
  }

  async update(id: string, updateUnitDto: UpdateUnitDto): Promise<Unit> {
    const unit = await this.findOne(id);
    Object.assign(unit, updateUnitDto);
    return this.unitRepository.save(unit);
  }

  async remove(id: string): Promise<void> {
    const unit = await this.findOne(id);
    await this.unitRepository.remove(unit);
  }
}
