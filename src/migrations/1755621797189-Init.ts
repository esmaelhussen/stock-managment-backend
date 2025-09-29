import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1755621797189 implements MigrationInterface {
  name = 'Init1755621797189';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "warehouse" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "address" character varying NOT NULL, "description" character varying, CONSTRAINT "UQ_d5d5470e55d4238b1239e9f154b" UNIQUE ("name"), CONSTRAINT "PK_965abf9f99ae8c5983ae74ebde8" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "warehouse"`);
  }
}
