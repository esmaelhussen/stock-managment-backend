import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1756286499630 implements MigrationInterface {
    name = 'Init1756286499630'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "shop" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "address" character varying NOT NULL, "description" character varying, "warehouse_id" uuid NOT NULL, CONSTRAINT "PK_ad47b7c6121fe31cb4b05438e44" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "users" ADD "shop_id" uuid`);
        await queryRunner.query(`ALTER TABLE "stock" ADD "shopId" uuid`);
        await queryRunner.query(`ALTER TABLE "stock_transaction" ADD "shopId" uuid`);
        await queryRunner.query(`ALTER TABLE "shop" ADD CONSTRAINT "FK_89426d5e6cae3fd4c02dde4db86" FOREIGN KEY ("warehouse_id") REFERENCES "warehouse"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_39e0ab619d2865a101db749751a" FOREIGN KEY ("shop_id") REFERENCES "shop"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "stock" ADD CONSTRAINT "FK_8d78a1a16b13becb25cc34a0602" FOREIGN KEY ("shopId") REFERENCES "shop"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "stock_transaction" ADD CONSTRAINT "FK_57e7c083b21364064728e0f0714" FOREIGN KEY ("shopId") REFERENCES "shop"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "stock_transaction" DROP CONSTRAINT "FK_57e7c083b21364064728e0f0714"`);
        await queryRunner.query(`ALTER TABLE "stock" DROP CONSTRAINT "FK_8d78a1a16b13becb25cc34a0602"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_39e0ab619d2865a101db749751a"`);
        await queryRunner.query(`ALTER TABLE "shop" DROP CONSTRAINT "FK_89426d5e6cae3fd4c02dde4db86"`);
        await queryRunner.query(`ALTER TABLE "stock_transaction" DROP COLUMN "shopId"`);
        await queryRunner.query(`ALTER TABLE "stock" DROP COLUMN "shopId"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "shop_id"`);
        await queryRunner.query(`DROP TABLE "shop"`);
    }

}
