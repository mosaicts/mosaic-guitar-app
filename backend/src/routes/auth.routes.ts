import { Router } from 'express';
import passport = require('passport');
import { UserController } from '../controller/UserController';
import {
  validate,
  validateUsername,
  validateEmail,
  validatePassword,
  checkEmailInUse,
  checkUsernameInUse,
  validateConfirmPassword
} from '../middlewares/validateUser';

const authRouter = Router();

authRouter.post('/login', UserController.login);

authRouter.post(
  '/signup',
  validateUsername,
  validateEmail,
  validatePassword,
  validateConfirmPassword,
  checkEmailInUse,
  checkUsernameInUse,
  validate,
  UserController.signup
);
authRouter.get('/signup/verify/:id/:token', UserController.signupVerify);
authRouter.post('/signup/resend', UserController.signupResend);

authRouter.post('/forgot', UserController.postForgot);
authRouter.post(
  '/reset',
  validatePassword,
  validateConfirmPassword,
  validate,
  UserController.resetPassword
);
authRouter.post('/reset/verify', UserController.resetVerify);

authRouter.post('/token', UserController.refreshToken);
authRouter.get(
  '/protected',
  passport.authenticate('jwt', { session: false }),
  UserController.protected
);

export default authRouter;
