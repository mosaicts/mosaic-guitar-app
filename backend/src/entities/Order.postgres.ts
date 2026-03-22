import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  Column
} from 'typeorm';
import { User } from './User.postgres';
import { OrderToItem } from './OrderToItem.postgres';

const Status = {
  CANCELLED: 'cancelled',
  SUCCESS: 'success',
  FAILED: 'failed',
  IN_PROGRESS: 'in-progress'
} as const;
type Status = (typeof Status)[keyof typeof Status];

@Entity({ name: 'order' })
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  userId: string;

  @ManyToOne(() => User, (user) => user.carts)
  user: User;

  @Column({ nullable: false })
  shippingAddress: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt: Date;

  @Column({
    type: 'enum',
    enum: Status,
    default: Status.IN_PROGRESS
  })
  status: string;

  @OneToMany(() => OrderToItem, (orderToItem) => orderToItem.order, { cascade: true })
  orderToItems: OrderToItem[];
}
