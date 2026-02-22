import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Cart } from './Cart.postgres';
import { Product } from './Product.postgres';

@Entity({ name: 'cart_item' })
export class CartToItem {
  @PrimaryGeneratedColumn('uuid')
  cartToItemId: string;

  @Column()
  cartId: string;

  @Column()
  itemId: string;

  @Column({ nullable: false })
  price: number;

  @Column({ nullable: false })
  quantity: number;

  @ManyToOne(() => Cart, (cart) => cart.cartToItems)
  cart: Cart;

  @ManyToOne(() => Product, (product) => product.cartToItems)
  item: Product;
}
