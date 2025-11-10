import { Request } from 'express';
// import { Repository } from "typeorm";
import guitars from '../example-guitars';

export class ProductService {
  // TODO: add guitar repository
  // constructor(private readonly guitarRepository: Repository<Guitar>) {}

  async listGuitars(req: Request) {
    return {
      products: guitars.map((guitar) => ({
        ...guitar,
        // image: `${req.protocol}://${req.get('host')}${guitar.image}`
        image: `app/Images${guitar.image}`
      }))
    };
  }

  async getGuitar(req: Request) {
    // @ts-ignore
    const product = guitars[req.guitarIndex];
    return { product: { ...product, image: `app/Images${product.image}` } };
  }

  async updateGuitar(req: Request) {
    // @ts-ignore
    const index = req.guitarIndex;
    const guitar = guitars[index];
    const product = { ...guitar, ...req.body };
    guitars[index] = product;
    return { message: 'updated', product };
  }

  async deleteGuitar(req: Request) {
    // @ts-ignore
    const guitarIndex = guitars[req.guitarIndex];
    guitars.splice(+guitarIndex, 1);
    return { message: 'deleted' };
  }
}
