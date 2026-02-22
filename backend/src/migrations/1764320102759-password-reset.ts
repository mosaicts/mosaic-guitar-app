import { MigrationInterface, QueryRunner } from 'typeorm';

export class PasswordReset1764320102759 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      ` 
          CREATE TABLE password_reset  (
            id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
            email text NOT NULL,
	    otp text NOT NULL,
            created_at timestamp DEFAULT now(),
            verified boolean DEFAULT FALSE,
            expiry text NOT NULL,
            completed_at timestamp
          )
      `
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE password_reset`);
  }
}
