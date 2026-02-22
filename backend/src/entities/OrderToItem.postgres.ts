import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Order } from './Order.postgres';
import { Product } from './Product.postgres';

@Entity({ name: 'order_item' })
export class OrderToItem {
  @PrimaryGeneratedColumn('uuid')
  orderToItemId: string;

  @Column()
  orderId: string;

  @Column()
  itemId: string;

  @Column({ nullable: false })
  price: number;

  @Column({ nullable: false })
  quantity: number;

  @Column({ nullable: false })
  discount: number;

  @ManyToOne(() => Order, (order) => order.orderToItems)
  order: Order;

  @ManyToOne(() => Product, (product) => product.orderToItems)
  item: Product;
}
