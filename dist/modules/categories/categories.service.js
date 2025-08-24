"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoriesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const category_entity_1 = require("../../entities/category.entity");
let CategoriesService = class CategoriesService {
    categoryRepository;
    constructor(categoryRepository) {
        this.categoryRepository = categoryRepository;
    }
    async findAll() {
        return this.categoryRepository.find();
    }
    async findOne(id) {
        const cat = await this.categoryRepository.findOneBy({ id });
        if (!cat)
            throw new common_1.NotFoundException('Category not found.');
        return cat;
    }
    async create(data) {
        const existing = await this.categoryRepository.findOneBy({
            name: data.name,
        });
        if (existing)
            throw new common_1.ConflictException('A category with this name already exists.');
        const cat = this.categoryRepository.create(data);
        return this.categoryRepository.save(cat);
    }
    async update(id, data) {
        const cat = await this.findOne(id);
        return this.categoryRepository.update(id, data);
    }
    async remove(id) {
        const cat = await this.findOne(id);
        return this.categoryRepository.delete(id);
    }
};
exports.CategoriesService = CategoriesService;
exports.CategoriesService = CategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(category_entity_1.Category)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], CategoriesService);
//# sourceMappingURL=categories.service.js.map