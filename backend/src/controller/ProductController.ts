import { Request, Response } from 'express';
import { productService } from '../repository';

export class ProductController {
  static async listGuitars(req: Request, res: Response) {
    const data = await productService.listGuitars(req);
    return res.status(200).json(data);
  }

  static async getGuitar(req: Request, res: Response) {
    const data = await productService.getGuitar(req);
    return res.status(200).json(data);
  }

  static async updateGuitar(req: Request, res: Response) {
    const data = await productService.updateGuitar(req);
    return res.status(200).json(data);
  }

  static async deleteGuitar(req: Request, res: Response) {
    const data = await productService.deleteGuitar(req);
    return res.status(200).json(data);
  }
}
