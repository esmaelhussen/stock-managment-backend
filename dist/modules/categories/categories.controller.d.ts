import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto';
export declare class CategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    create(dto: CreateCategoryDto): Promise<import("../../entities/category.entity").Category>;
    findAll(): Promise<import("../../entities/category.entity").Category[]>;
    findOne(id: number): Promise<import("../../entities/category.entity").Category | null>;
    update(id: number, dto: UpdateCategoryDto): Promise<import("typeorm").UpdateResult>;
    remove(id: number): Promise<import("typeorm").DeleteResult>;
}
