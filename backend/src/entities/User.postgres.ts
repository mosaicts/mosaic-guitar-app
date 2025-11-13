import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn
} from 'typeorm';

// export enum UserRole {
//   ADMIN = 'admin',
//   USER = 'user'
// }
const UserRole = {
  ADMIN: 'admin',
  USER: 'user'
} as const;
type UserRole = (typeof UserRole)[keyof typeof UserRole];

@Entity({ name: 'user' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  firstName: string;

  @Column({ nullable: false })
  lastName: string;

  @Column({ nullable: false })
  username: string;

  @Column({ nullable: false })
  email: string;

  @Column({ nullable: false })
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER
  })
  role: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: false })
  refreshToken: string;

  @Column({ nullable: false })
  refreshTokenExpiresAt: Date;

  @Column()
  profilePicUrl: string;

  @UpdateDateColumn()
  profilePicUpdatedAt: Date;

  @Column({ default: false })
  verified: boolean;
}
