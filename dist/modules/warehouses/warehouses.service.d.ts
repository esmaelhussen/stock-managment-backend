import { Repository } from 'typeorm';
import { Warehouse } from '../../entities/warehouse.entity';
import { CreateWarehouseDto, UpdateWarehouseDto } from './dto';
export declare class WarehousesService {
    private readonly warehouseRepository;
    constructor(warehouseRepository: Repository<Warehouse>);
    create(dto: CreateWarehouseDto): Promise<Warehouse>;
    findAll(): Promise<Warehouse[]>;
    findOne(id: number): Promise<Warehouse | null>;
    update(id: number, dto: UpdateWarehouseDto): Promise<import("typeorm").UpdateResult>;
    remove(id: number): Promise<import("typeorm").DeleteResult>;
}
