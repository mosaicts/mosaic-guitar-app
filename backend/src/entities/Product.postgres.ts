import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn
} from 'typeorm';
import { OrderToItem } from './OrderToItem.postgres';
import { CartToItem } from './CartToItem.postgres';

@Entity({ name: 'product' })
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  xs;
  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  image: string;

  @Column({ nullable: false })
  shortDescription: string;

  @Column({ nullable: false })
  description: string;

  @Column({ nullable: false })
  price: number;

  @Column({ nullable: true })
  remaining: number;

  @Column({ nullable: true })
  discount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => OrderToItem, (orderItem) => orderItem.item)
  cartToItems: CartToItem[];

  @OneToMany(() => OrderToItem, (orderToItem) => orderToItem.item)
  orderToItems: OrderToItem[];
}
