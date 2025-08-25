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
exports.StockTransactionService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const stockTransaction_entity_1 = require("../../entities/stockTransaction.entity");
const stock_entity_1 = require("../../entities/stock.entity");
const warehouse_entity_1 = require("../../entities/warehouse.entity");
const product_entity_1 = require("../../entities/product.entity");
const user_entity_1 = require("../../entities/user.entity");
let StockTransactionService = class StockTransactionService {
    stockTransactionRepository;
    stockRepository;
    userRepository;
    warehouseRepository;
    productRepository;
    constructor(stockTransactionRepository, stockRepository, userRepository, warehouseRepository, productRepository) {
        this.stockTransactionRepository = stockTransactionRepository;
        this.stockRepository = stockRepository;
        this.userRepository = userRepository;
        this.warehouseRepository = warehouseRepository;
        this.productRepository = productRepository;
    }
    async handleTransaction(productId, quantity, type, sourceWarehouseId, targetWarehouseId, transactedById) {
        const product = await this.productRepository.findOne({
            where: { id: productId },
        });
        if (!product)
            throw new common_1.BadRequestException('Product not found');
        if (product.price === null || product.price === undefined) {
            throw new common_1.BadRequestException('Product price is not set');
        }
        const transactedBy = await this.userRepository.findOne({
            where: { id: transactedById },
        });
        if (!transactedBy)
            throw new common_1.BadRequestException('User not found');
        const sourceWarehouse = await this.warehouseRepository.findOne({
            where: { id: sourceWarehouseId },
        });
        if (!sourceWarehouse)
            throw new common_1.BadRequestException('Source warehouse not found');
        let targetWarehouse = undefined;
        if (type === stockTransaction_entity_1.TransactionType.TRANSFER && targetWarehouseId) {
            const warehouse = await this.warehouseRepository.findOne({
                where: { id: targetWarehouseId },
            });
            if (!warehouse)
                throw new common_1.BadRequestException('Target warehouse not found');
            targetWarehouse = warehouse;
        }
        if (!transactedById) {
            throw new common_1.BadRequestException('Transacted by user is required');
        }
        if (type === stockTransaction_entity_1.TransactionType.ADD) {
            let stock = await this.stockRepository.findOne({
                where: {
                    warehouse: { id: sourceWarehouseId },
                    product: { id: productId },
                },
            });
            if (stock) {
                const totalValue = stock.quantity * stock.price + quantity * product.price;
                const totalQuantity = stock.quantity + quantity;
                stock.price = totalValue / totalQuantity;
                stock.quantity = totalQuantity;
            }
            else {
                stock = this.stockRepository.create({
                    warehouse: sourceWarehouse,
                    product,
                    quantity,
                    price: product.price,
                });
            }
            await this.stockRepository.save(stock);
        }
        else if (type === stockTransaction_entity_1.TransactionType.REMOVE) {
            const stock = await this.stockRepository.findOne({
                where: {
                    warehouse: { id: sourceWarehouseId },
                    product: { id: productId },
                },
            });
            if (!stock || stock.quantity < quantity) {
                throw new common_1.BadRequestException('Insufficient stock to remove');
            }
            stock.quantity -= quantity;
            await this.stockRepository.save(stock);
        }
        else if (type === stockTransaction_entity_1.TransactionType.TRANSFER) {
            if (!targetWarehouseId) {
                throw new common_1.BadRequestException('Target warehouse is required for transfer');
            }
            if (sourceWarehouseId === targetWarehouseId) {
                throw new common_1.BadRequestException('Source and target warehouse cannot be the same');
            }
            const sourceStock = await this.stockRepository.findOne({
                where: {
                    warehouse: { id: sourceWarehouseId },
                    product: { id: productId },
                },
            });
            if (!sourceStock || sourceStock.quantity < quantity) {
                throw new common_1.BadRequestException('Insufficient stock to transfer');
            }
            const transferPrice = sourceStock.price || product.price;
            sourceStock.quantity -= quantity;
            await this.stockRepository.save(sourceStock);
            let targetStock = await this.stockRepository.findOne({
                where: {
                    warehouse: { id: targetWarehouseId },
                    product: { id: productId },
                },
            });
            if (targetStock) {
                const totalValue = targetStock.quantity * targetStock.price + quantity * transferPrice;
                const totalQuantity = targetStock.quantity + quantity;
                targetStock.price = totalValue / totalQuantity;
                targetStock.quantity = totalQuantity;
            }
            else {
                targetStock = this.stockRepository.create({
                    warehouse: targetWarehouse,
                    product,
                    quantity,
                    price: transferPrice,
                });
            }
            await this.stockRepository.save(targetStock);
        }
        const transaction = this.stockTransactionRepository.create({
            product,
            quantity,
            price: product.price,
            type,
            sourceWarehouse,
            targetWarehouse: type === stockTransaction_entity_1.TransactionType.TRANSFER && targetWarehouse
                ? targetWarehouse
                : undefined,
            transactedBy,
        });
        return this.stockTransactionRepository.save(transaction);
    }
    async getAllTransactions(warehouseId) {
        return this.stockTransactionRepository.find({
            where: [
                { sourceWarehouse: { id: warehouseId } },
                { targetWarehouse: { id: warehouseId } },
            ],
            relations: [
                'sourceWarehouse',
                'targetWarehouse',
                'product',
                'stock',
                'transactedBy',
            ],
        });
    }
    async getAllStock(warehouseId) {
        return this.stockRepository.find({
            where: { warehouse: { id: warehouseId } },
            relations: ['product', 'warehouse'],
        });
    }
};
exports.StockTransactionService = StockTransactionService;
exports.StockTransactionService = StockTransactionService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(stockTransaction_entity_1.StockTransaction)),
    __param(1, (0, typeorm_1.InjectRepository)(stock_entity_1.Stock)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(3, (0, typeorm_1.InjectRepository)(warehouse_entity_1.Warehouse)),
    __param(4, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], StockTransactionService);
//# sourceMappingURL=stockTransaction.service.js.map