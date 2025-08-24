import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class Init1755670946831 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
