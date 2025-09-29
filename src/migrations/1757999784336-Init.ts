import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1757999784336 implements MigrationInterface {
    name = 'Init1757999784336'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sales_transaction" ADD "discountAmount" numeric(12,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "sales_transaction" ADD "discountPercent" numeric(5,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`CREATE TYPE "public"."sales_transaction_discounttype_enum" AS ENUM('fixed', 'percent', 'none')`);
        await queryRunner.query(`ALTER TABLE "sales_transaction" ADD "discountType" "public"."sales_transaction_discounttype_enum" NOT NULL DEFAULT 'none'`);
        await queryRunner.query(`ALTER TABLE "sales_transaction" ADD "finalPrice" numeric(12,2)`);
        await queryRunner.query(`ALTER TABLE "sales_transaction_item" ADD "discountAmount" numeric(12,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "sales_transaction_item" ADD "discountPercent" numeric(5,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`CREATE TYPE "public"."sales_transaction_item_discounttype_enum" AS ENUM('fixed', 'percent', 'none')`);
        await queryRunner.query(`ALTER TABLE "sales_transaction_item" ADD "discountType" "public"."sales_transaction_item_discounttype_enum" NOT NULL DEFAULT 'none'`);
        await queryRunner.query(`ALTER TABLE "sales_transaction_item" ADD "finalPrice" numeric(12,2)`);
        await queryRunner.query(`ALTER TABLE "sales_transaction" ALTER COLUMN "customerType" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "sales_transaction" ALTER COLUMN "customerType" SET DEFAULT 'Walk-In'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sales_transaction" ALTER COLUMN "customerType" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "sales_transaction" ALTER COLUMN "customerType" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "sales_transaction_item" DROP COLUMN "finalPrice"`);
        await queryRunner.query(`ALTER TABLE "sales_transaction_item" DROP COLUMN "discountType"`);
        await queryRunner.query(`DROP TYPE "public"."sales_transaction_item_discounttype_enum"`);
        await queryRunner.query(`ALTER TABLE "sales_transaction_item" DROP COLUMN "discountPercent"`);
        await queryRunner.query(`ALTER TABLE "sales_transaction_item" DROP COLUMN "discountAmount"`);
        await queryRunner.query(`ALTER TABLE "sales_transaction" DROP COLUMN "finalPrice"`);
        await queryRunner.query(`ALTER TABLE "sales_transaction" DROP COLUMN "discountType"`);
        await queryRunner.query(`DROP TYPE "public"."sales_transaction_discounttype_enum"`);
        await queryRunner.query(`ALTER TABLE "sales_transaction" DROP COLUMN "discountPercent"`);
        await queryRunner.query(`ALTER TABLE "sales_transaction" DROP COLUMN "discountAmount"`);
    }

}
