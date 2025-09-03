import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1756892958745 implements MigrationInterface {
    name = 'Init1756892958745'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" ADD "image" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "image"`);
    }

}
