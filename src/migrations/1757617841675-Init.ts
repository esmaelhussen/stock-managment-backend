import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1757617841675 implements MigrationInterface {
    name = 'Init1757617841675'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" ADD "brand" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "brand"`);
    }

}
