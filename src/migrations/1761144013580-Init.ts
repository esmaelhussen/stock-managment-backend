import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1761144013580 implements MigrationInterface {
    name = 'Init1761144013580'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "brand" DROP CONSTRAINT "UQ_5f468ae5696f07da025138e38f7"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "brand" ADD CONSTRAINT "UQ_5f468ae5696f07da025138e38f7" UNIQUE ("name")`);
    }

}
