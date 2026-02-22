import { MigrationInterface, QueryRunner } from 'typeorm';

export class Cart1771210084488 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      ` 
          CREATE TABLE cart  (
            id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id uuid NOT NULL REFERENCES "user" (id) ON DELETE RESTRICT,
            created_at timestamp DEFAULT now(),
            updated_at timestamp
          ); 
      `
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE cart`);
  }
}
