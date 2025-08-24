"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Init1755976560679 = void 0;
class Init1755976560679 {
    name = 'Init1755976560679';
    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE "stock" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "quantity" integer NOT NULL, "price" numeric(10,2) NOT NULL, "productId" uuid, "warehouseId" uuid, CONSTRAINT "PK_092bc1fc7d860426a1dec5aa8e9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."stock_transaction_type_enum" AS ENUM('add', 'remove', 'transfer')`);
        await queryRunner.query(`CREATE TABLE "stock_transaction" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "quantity" integer NOT NULL, "price" numeric(10,2) NOT NULL, "type" "public"."stock_transaction_type_enum" NOT NULL, "timestamp" TIMESTAMP NOT NULL DEFAULT now(), "stockId" uuid, "sourceWarehouseId" uuid, "targetWarehouseId" uuid, "productId" uuid, CONSTRAINT "PK_8a81a89b9130bda3a5277cce53a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "stock" ADD CONSTRAINT "FK_e855a71c31948188c2bf78824a5" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "stock" ADD CONSTRAINT "FK_2cc5be32db1259f44995d0100aa" FOREIGN KEY ("warehouseId") REFERENCES "warehouse"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "stock_transaction" ADD CONSTRAINT "FK_9e595a192624e946b315a92bdbb" FOREIGN KEY ("stockId") REFERENCES "stock"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "stock_transaction" ADD CONSTRAINT "FK_4d1c175eef2cdf8879bcfd94a76" FOREIGN KEY ("sourceWarehouseId") REFERENCES "warehouse"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "stock_transaction" ADD CONSTRAINT "FK_af225b98743fb6bcfd709df22ba" FOREIGN KEY ("targetWarehouseId") REFERENCES "warehouse"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "stock_transaction" ADD CONSTRAINT "FK_d802af4d660cb52ed448ac0fa46" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "stock_transaction" DROP CONSTRAINT "FK_d802af4d660cb52ed448ac0fa46"`);
        await queryRunner.query(`ALTER TABLE "stock_transaction" DROP CONSTRAINT "FK_af225b98743fb6bcfd709df22ba"`);
        await queryRunner.query(`ALTER TABLE "stock_transaction" DROP CONSTRAINT "FK_4d1c175eef2cdf8879bcfd94a76"`);
        await queryRunner.query(`ALTER TABLE "stock_transaction" DROP CONSTRAINT "FK_9e595a192624e946b315a92bdbb"`);
        await queryRunner.query(`ALTER TABLE "stock" DROP CONSTRAINT "FK_2cc5be32db1259f44995d0100aa"`);
        await queryRunner.query(`ALTER TABLE "stock" DROP CONSTRAINT "FK_e855a71c31948188c2bf78824a5"`);
        await queryRunner.query(`DROP TABLE "stock_transaction"`);
        await queryRunner.query(`DROP TYPE "public"."stock_transaction_type_enum"`);
        await queryRunner.query(`DROP TABLE "stock"`);
    }
}
exports.Init1755976560679 = Init1755976560679;
//# sourceMappingURL=1755976560679-Init.js.map