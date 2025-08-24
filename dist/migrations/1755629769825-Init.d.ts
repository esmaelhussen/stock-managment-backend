import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class Init1755629769825 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
