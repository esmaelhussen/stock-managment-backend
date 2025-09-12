import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1757689279858 implements MigrationInterface {
    name = 'Init1757689279858'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" ADD "alertQuantity" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "product" ADD "stock" integer NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "stock"`);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "alertQuantity"`);
    }

}
