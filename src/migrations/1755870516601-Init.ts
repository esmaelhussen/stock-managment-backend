import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1755870516601 implements MigrationInterface {
  name = 'Init1755870516601';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product" ADD "price" numeric(10,2) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" DROP CONSTRAINT "PK_bebc9158e480b949565b4dc7a82"`,
    );
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "id"`);
    await queryRunner.query(
      `ALTER TABLE "product" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ADD CONSTRAINT "PK_bebc9158e480b949565b4dc7a82" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ADD CONSTRAINT "UQ_22cc43e9a74d7498546e9a63e77" UNIQUE ("name")`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ADD CONSTRAINT "UQ_34f6ca1cd897cc926bdcca1ca39" UNIQUE ("sku")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product" DROP CONSTRAINT "UQ_34f6ca1cd897cc926bdcca1ca39"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" DROP CONSTRAINT "UQ_22cc43e9a74d7498546e9a63e77"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" DROP CONSTRAINT "PK_bebc9158e480b949565b4dc7a82"`,
    );
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "id"`);
    await queryRunner.query(`ALTER TABLE "product" ADD "id" SERIAL NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "product" ADD CONSTRAINT "PK_bebc9158e480b949565b4dc7a82" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "price"`);
  }
}
