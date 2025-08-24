import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1755670946831 implements MigrationInterface {
  name = 'Init1755670946831';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "unit" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, CONSTRAINT "UQ_5618100486bb99d78de022e5829" UNIQUE ("name"), CONSTRAINT "PK_4252c4be609041e559f0c80f58a" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "unit"`);
  }
}
