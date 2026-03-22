import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity({ name: 'password_reset' })
export class PasswordReset {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  email: string;

  @Column({ nullable: false })
  otp: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Column({ default: false })
  verified: boolean;

  @Column({ nullable: false })
  expiry: string;

  @Column({ type: 'timestamptz', nullable: true })
  completedAt: Date;
}
