import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserWarehouse1756054626238 implements MigrationInterface {
  name = 'UserWarehouse1756054626238';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ADD "warehouse_id" uuid`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_fa43267f9de1621105d7f0fea48" FOREIGN KEY ("warehouse_id") REFERENCES "warehouse"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "FK_fa43267f9de1621105d7f0fea48"`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "warehouse_id"`);
  }
}
