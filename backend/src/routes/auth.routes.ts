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

authRouter.post(
  '/register',
  validateUsername,
  validateEmail,
  validatePassword,
  validateConfirmPassword,
  checkEmailInUse,
  checkUsernameInUse,
  validate,
  UserController.register
);
authRouter.get('/verify/email/:id/:token', UserController.verify);
authRouter.post('/resend-verification/email', UserController.resendVerificationMail);
authRouter.post('/login', UserController.login);
authRouter.post('/refresh-token', UserController.refreshToken);
authRouter.get(
  '/protected',
  passport.authenticate('jwt', { session: false }),
  UserController.protected
);

export default authRouter;
