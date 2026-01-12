import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn
} from 'typeorm';

@Entity({ name: 'password_reset' })
export class PasswordReset {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  email: string;

  @Column({ nullable: false })
  otp: string;

  @Column({ nullable: false })
  expiry: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  completedAt: Date;

  @Column({ default: false })
  verified: boolean;
}
