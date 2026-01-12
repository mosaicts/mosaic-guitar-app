import { MigrationInterface, QueryRunner } from 'typeorm';

export class PasswordReset1764320102759 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      ` 
          --Table Definition
          CREATE TABLE "password_reset"  (
            "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
            "email" VARCHAR(255) NOT NULL,
	    "resetToken" VARCHAR NOT NULL,
            "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
            CONSTRAINT "password_reset_id_pkey" PRIMARY KEY ("id")
          )
      `
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "password_reset"`);
  }
}
