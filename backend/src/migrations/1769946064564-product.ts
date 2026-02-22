import { MigrationInterface, QueryRunner } from 'typeorm';

export class Product1769946064564 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      ` 
          CREATE TABLE product  (
            id text PRIMARY KEY,
            name text NOT NULL,
            image text NOT NULL,
            short_description text NOT NULL,
            description text NOT NULL,
            price numeric NOT NULL,
            remaining integer,
            discount numeric,
            created_at timestamp DEFAULT now(),
            updated_at timestamp
          );
      `
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE product`);
  }
}
