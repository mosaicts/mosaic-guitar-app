import { Request, Response, NextFunction } from 'express';
import { Repository } from 'typeorm';
import { User } from '../entities/User.postgres';

export class UserService {
  constructor(private readonly userRepository: Repository<User>) {}

  async getAll(res: Response, next: NextFunction) {
    const users = await this.userRepository.find();
    res.status(200).json({ users });
  }

  async getProfile(req: Request, res: Response) {
    const { id } = req.params;
    let user = req.user;

    if (user) {
      return res.status(200).json({ user });
    }

    try {
      user = await this.userRepository.findOne({
        where: { id }
      });
    } catch (err) {
      return res.status(400).json({ message: 'User not found' });
    }
    res.status(200).json({ user });
  }

  async updateUser(req: Request, res: Response) {
    // await new Promise((resolve) => setTimeout(resolve, 1000));
    let user = req.user as User;
    user = { ...user, ...req.body };
    await this.userRepository.save(user);
    res.status(200).json({ message: 'success' });
  }

  async deleteUser(req: Request, res: Response) {
    const { id } = req.params;
    try {
      let user = await this.userRepository.findOne({
        where: { id }
      });
      await this.userRepository.remove(user);
    } catch (err) {
      console.log(err);
      return res.status(400).json({ message: 'An error occurred' });
    }

    res.status(200).json({ message: 'success' });
  }
}
