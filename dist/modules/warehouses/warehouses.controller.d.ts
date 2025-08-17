import { WarehousesService } from './warehouses.service';
import { CreateWarehouseDto, UpdateWarehouseDto } from './dto';
export declare class WarehousesController {
    private readonly warehousesService;
    constructor(warehousesService: WarehousesService);
    create(dto: CreateWarehouseDto): Promise<import("../../entities/warehouse.entity").Warehouse>;
    findAll(): Promise<import("../../entities/warehouse.entity").Warehouse[]>;
    findOne(id: number): Promise<import("../../entities/warehouse.entity").Warehouse | null>;
    update(id: number, dto: UpdateWarehouseDto): Promise<import("typeorm").UpdateResult>;
    remove(id: number): Promise<import("typeorm").DeleteResult>;
}
