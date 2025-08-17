import { Repository } from 'typeorm';
import { Unit } from '../../entities/unit.entity';
import { CreateUnitDto, UpdateUnitDto } from './dto';
export declare class UnitsService {
    private readonly unitRepository;
    constructor(unitRepository: Repository<Unit>);
    create(dto: CreateUnitDto): Promise<Unit>;
    findAll(): Promise<Unit[]>;
    findOne(id: number): Promise<Unit | null>;
    update(id: number, dto: UpdateUnitDto): Promise<import("typeorm").UpdateResult>;
    remove(id: number): Promise<import("typeorm").DeleteResult>;
}
