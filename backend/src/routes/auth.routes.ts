import { Router } from 'express';
import passport = require('passport');
import { UserController } from '../controller/UserController';
import {
  validate,
  validateUsername,
  validateEmail,
  validatePassword,
  checkEmailInUse,
  checkUsernameInUse
} from '../middlewares/validateUser';

const authRouter = Router();

authRouter.post(
  '/register',
  validateUsername,
  validateEmail,
  validatePassword,
  checkEmailInUse,
  checkUsernameInUse,
  validate,
  UserController.register
);
authRouter.post('/verify', UserController.verify);
authRouter.post('/login', UserController.login);
authRouter.post('/refresh-token', UserController.refreshToken);
authRouter.get(
  '/protected',
  passport.authenticate('jwt', { session: false }),
  UserController.protected
);

export default authRouter;
