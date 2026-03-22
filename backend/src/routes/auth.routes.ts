import { Router } from 'express';
import crypto from 'crypto';
import passport = require('passport');
import envConfig from '../config/envConfig';
import { UserController } from '../controller/UserController';
import { User } from '../entities/User.postgres';
import handleGetRepository from '../utils/handleGetRepository';
import {
  validate,
  validateUsername,
  validateEmail,
  validatePassword,
  checkEmailInUse,
  checkUsernameInUse,
  validateConfirmPassword
} from '../middlewares/validateUser';
import { setCookie, REFRESH_TOKEN_COOKIE_MAX_AGE } from '../lib/cookie';
import { sha256 } from '../lib/jwt';
import { uuidv4 } from '../lib/auth';

const authRouter = Router();
const userRepository = handleGetRepository(User);

authRouter.post('/login', UserController.login);
authRouter.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));
authRouter.get(
  '/facebook/callback',
  passport.authenticate('facebook', {
    failureRedirect: envConfig.CLIENT_URL,
    session: false
  }),
  async (req, res) => {
    const user = req.user as User;
    const fingerprint = crypto.randomBytes(50).toString('hex');
    // Generate refresh token
    const refreshToken = uuidv4();
    user.refreshToken = sha256(refreshToken);
    await userRepository.save(user);
    setCookie(fingerprint, refreshToken, res);
    res.redirect(envConfig.CLIENT_URL);
  }
);
authRouter.get('/google', passport.authenticate('google'));
authRouter.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: envConfig.CLIENT_URL,
    session: false
  }),
  async (req, res) => {
    const user = req.user as User;
    const fingerprint = crypto.randomBytes(50).toString('hex');
    // Generate refresh token
    const refreshToken = uuidv4();
    user.refreshToken = sha256(refreshToken);
    await userRepository.save(user);
    setCookie(fingerprint, refreshToken, res);
    res.redirect(envConfig.CLIENT_URL);
  }
);

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
authRouter.post('/token', UserController.updateToken);
authRouter.get(
  '/protected',
  passport.authenticate('jwt', { session: false }),
  UserController.protected
);
authRouter.post('/signout', UserController.signout);

export default authRouter;
