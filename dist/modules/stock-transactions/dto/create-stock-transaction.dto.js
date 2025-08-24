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
exports.CreateStockTransactionDto = void 0;
const class_validator_1 = require("class-validator");
const stockTransaction_entity_1 = require("../../../entities/stockTransaction.entity");
class CreateStockTransactionDto {
    productId;
    quantity;
    type;
    sourceWarehouseId;
    targetWarehouseId;
}
exports.CreateStockTransactionDto = CreateStockTransactionDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateStockTransactionDto.prototype, "productId", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], CreateStockTransactionDto.prototype, "quantity", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(stockTransaction_entity_1.TransactionType),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateStockTransactionDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.ValidateIf)((o) => o.type === stockTransaction_entity_1.TransactionType.REMOVE ||
        o.type === stockTransaction_entity_1.TransactionType.TRANSFER ||
        o.type === stockTransaction_entity_1.TransactionType.ADD),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateStockTransactionDto.prototype, "sourceWarehouseId", void 0);
__decorate([
    (0, class_validator_1.ValidateIf)((o) => o.type === stockTransaction_entity_1.TransactionType.TRANSFER),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateStockTransactionDto.prototype, "targetWarehouseId", void 0);
//# sourceMappingURL=create-stock-transaction.dto.js.map