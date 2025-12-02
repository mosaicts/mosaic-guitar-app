import { MigrationInterface, QueryRunner } from 'typeorm';

export class User1762762221156 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      ` 
          --Table Definition
          CREATE TABLE "user"  (
            "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
            "firstName" VARCHAR(50) NOT NULL,
            "lastName" VARCHAR(50) NOT NULL,
            "username" VARCHAR(50) NOT NULL,
            "email" VARCHAR(255) NOT NULL,
            "password" VARCHAR(255) NOT NULL,
            "role"  VARCHAR(50) NOT NULL DEFAULT 'user',
            "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
            "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
            "refreshToken" VARCHAR,
            "refreshTokenExpiresAt" TIMESTAMP,
	    "profilePicUrl" VARCHAR(255) NOT NULL,
	    "profilePicUpdatedAt" TIMESTAMP NOT NULL DEFAULT now(),
	    "verified" BOOLEAN NOT NULL DEFAULT FALSE,
            CONSTRAINT "users_id_pkey" PRIMARY KEY ("id")
          )
      `
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "user"`);
  }
}
