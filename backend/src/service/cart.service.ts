import { Request, Response, NextFunction } from 'express';
import { Redis } from 'ioredis';

export class CartService {
  constructor(private readonly redis: Redis) {}

  async getAll(req: Request, res: Response) {
    const items = await this.redis.hgetall(`user:${req.body.userId}`);
    res.status(200).json({ items });
  }
}
