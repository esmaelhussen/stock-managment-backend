import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1757851715138 implements MigrationInterface {
    name = 'Init1757851715138'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sales_transaction" RENAME COLUMN "walkInCustomerName" TO "customerType"`);
        await queryRunner.query(`ALTER TABLE "sales_transaction" DROP COLUMN "customerType"`);
        await queryRunner.query(`CREATE TYPE "public"."sales_transaction_customertype_enum" AS ENUM('Walk-In', 'Regular')`);
        await queryRunner.query(`ALTER TABLE "sales_transaction" ADD "customerType" "public"."sales_transaction_customertype_enum" NOT NULL DEFAULT 'Walk-In'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sales_transaction" DROP COLUMN "customerType"`);
        await queryRunner.query(`DROP TYPE "public"."sales_transaction_customertype_enum"`);
        await queryRunner.query(`ALTER TABLE "sales_transaction" ADD "customerType" character varying`);
        await queryRunner.query(`ALTER TABLE "sales_transaction" RENAME COLUMN "customerType" TO "walkInCustomerName"`);
    }

}
