import { MigrationInterface, QueryRunner } from 'typeorm';

export class User1762762221156 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      ` 
          CREATE TYPE user_role AS ENUM ('user', 'admin');

          CREATE TABLE "user"  (
            id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
            first_name text,
            last_name text,
            username text,
            email text,
            password text DEFAULT NULL,
            role user_role,
            secret text,
            created_at timestamp DEFAULT now(),
            updated_at timestamp,
            refresh_token text,
            refresh_token_expires_at timestamp,
	    avatar text,
	    verified boolean DEFAULT false
          )
      `
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "user"`);
  }
}
