import { NextFunction, Request, Response } from 'express';
import { userService, authService } from '../repository';

export class UserController {
  static async protected(req: Request, res: Response) {
    await authService.protected(res);
  }

  static async login(req: Request, res: Response) {
    await authService.login(req, res);
  }

  static async signup(req: Request, res: Response) {
    await authService.signup(req, res);
  }

  static async signupVerify(req: Request, res: Response) {
    await authService.signupVerify(req, res);
  }

  static async signupResend(req: Request, res: Response) {
    await authService.signupResend(req, res);
  }

  static async postForgot(req: Request, res: Response) {
    await authService.postForgot(req, res);
  }

  static async resetVerify(req: Request, res: Response) {
    await authService.resetVerify(req, res);
  }

  static async resetPassword(req: Request, res: Response) {
    await authService.resetPassword(req, res);
  }

  }

  static async refreshToken(req: Request, res: Response) {
    await authService.refreshJwt(req, res);
  }

  static async getAll(req: Request, res: Response, next: NextFunction) {
    await userService.getAll(res, next);
  }

  static async getProfile(req: Request, res: Response) {
    await userService.getProfile(req, res);
  }

  static async updateUser(req: Request, res: Response) {
    await userService.updateUser(req, res);
  }

  static async deleteUser(req: Request, res: Response) {
    await userService.deleteUser(req, res);
  }
}
