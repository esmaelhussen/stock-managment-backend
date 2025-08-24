import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1756019484975 implements MigrationInterface {
  name = 'Init1756019484975';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "stock" ADD "timestamp" TIMESTAMP NOT NULL DEFAULT now()`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "stock" DROP COLUMN "timestamp"`);
  }
}
