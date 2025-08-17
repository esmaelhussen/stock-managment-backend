import { UnitsService } from './units.service';
import { CreateUnitDto, UpdateUnitDto } from './dto';
export declare class UnitsController {
    private readonly unitsService;
    constructor(unitsService: UnitsService);
    create(dto: CreateUnitDto): Promise<import("../../entities/unit.entity").Unit>;
    findAll(): Promise<import("../../entities/unit.entity").Unit[]>;
    findOne(id: number): Promise<import("../../entities/unit.entity").Unit | null>;
    update(id: number, dto: UpdateUnitDto): Promise<import("typeorm").UpdateResult>;
    remove(id: number): Promise<import("typeorm").DeleteResult>;
}
