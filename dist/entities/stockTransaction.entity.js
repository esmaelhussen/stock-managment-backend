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
Object.defineProperty(exports, "__esModule", { value: true });
exports.StockTransaction = exports.TransactionType = void 0;
const typeorm_1 = require("typeorm");
const stock_entity_1 = require("./stock.entity");
const warehouse_entity_1 = require("./warehouse.entity");
const product_entity_1 = require("./product.entity");
var TransactionType;
(function (TransactionType) {
    TransactionType["ADD"] = "add";
    TransactionType["REMOVE"] = "remove";
    TransactionType["TRANSFER"] = "transfer";
})(TransactionType || (exports.TransactionType = TransactionType = {}));
let StockTransaction = class StockTransaction {
    id;
    stock;
    sourceWarehouse;
    targetWarehouse;
    product;
    quantity;
    price;
    type;
    timestamp;
};
exports.StockTransaction = StockTransaction;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], StockTransaction.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => stock_entity_1.Stock, { nullable: true }),
    __metadata("design:type", stock_entity_1.Stock)
], StockTransaction.prototype, "stock", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => warehouse_entity_1.Warehouse, { nullable: true }),
    __metadata("design:type", warehouse_entity_1.Warehouse)
], StockTransaction.prototype, "sourceWarehouse", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => warehouse_entity_1.Warehouse, { nullable: true }),
    __metadata("design:type", warehouse_entity_1.Warehouse)
], StockTransaction.prototype, "targetWarehouse", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => product_entity_1.Product),
    __metadata("design:type", product_entity_1.Product)
], StockTransaction.prototype, "product", void 0);
__decorate([
    (0, typeorm_1.Column)('int'),
    __metadata("design:type", Number)
], StockTransaction.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], StockTransaction.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: TransactionType,
    }),
    __metadata("design:type", String)
], StockTransaction.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], StockTransaction.prototype, "timestamp", void 0);
exports.StockTransaction = StockTransaction = __decorate([
    (0, typeorm_1.Entity)()
], StockTransaction);
//# sourceMappingURL=stockTransaction.entity.js.map