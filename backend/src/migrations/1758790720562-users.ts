import { MigrationInterface, QueryRunner } from 'typeorm';

export class User1762762221156 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      ` 
          --Table Definition
          CREATE TABLE "user"  (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
            "firstName" character varying NOT NULL,
            "lastName" character varying NOT NULL,
            "username" character varying NOT NULL,
            "email" character varying NOT NULL,
            "password" character varying NOT NULL,
            "role"  character varying NOT NULL DEFAULT 'user',
            "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
            "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
            "refreshToken" character varying NOT NULL,
            "refreshTokenExpiresAt" TIMESTAMP NOT NULL,
	    "profilePicUrl" character varying NOT NULL,
	    "profilePicUpdatedAt" TIMESTAMP NOT NULL DEFAULT now(),
            CONSTRAINT "users_id_pkey" PRIMARY KEY ("id")
          )
      `
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "user"`, undefined);
  }
}
