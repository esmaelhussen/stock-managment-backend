import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1757649720222 implements MigrationInterface {
    name = 'Init1757649720222'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "brand" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, CONSTRAINT "UQ_5f468ae5696f07da025138e38f7" UNIQUE ("name"), CONSTRAINT "PK_a5d20765ddd942eb5de4eee2d7f" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "brand"`);
    }

}
