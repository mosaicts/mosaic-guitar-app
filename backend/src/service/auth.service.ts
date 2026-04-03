import { Request, Response } from 'express';
import { Repository } from 'typeorm';
import crypto from 'crypto';
import * as OTPAuth from 'otpauth';
import envConfig from '../config/envConfig';

import { checkPassword, hashPassword } from '../lib/password';
import { setCookie, FINGERPRINT_COOKIE_NAME, REFRESH_TOKEN_COOKIE_NAME } from '../lib/cookie';
import { generateJwt, sha256, verifyJwt } from '../lib/jwt';
import { generateTOTP, uuidv4 } from '../lib/auth';
import {
  maxConsecutiveLoginFailsByEmailAndIP,
  maxLoginFailsByIPperDay,
  maxLoginFailsByEmailPerDay,
  maxWrongOTPVerifyByEmailPerDay,
  limiterConsecutiveLoginFailsByEmailAndIP,
  limiterSlowBruteByIP,
  limiterSlowBruteByEmail,
  limiterSlowBruteOTPVerifyByEmail,
  getEmailIPkey,
  checkDeviceWasUsedPreviously
} from '../config/rateLimiter';
import { User } from '../entities/User.postgres';
import { PasswordReset } from '../entities/PasswordReset.postgres';
import { sendVerificationLinkToMail, sendVerificationCodeToMail } from '../config/emailTransporter';

export class AuthService {
  constructor(
    private readonly userRepository: Repository<User>,
    private readonly passwordResetRepository: Repository<PasswordReset>
  ) {}

  async protected(res: Response) {
    res.status(200).json({
      message: 'You are successfully authenticated to this route!'
    });
  }

  async login(req: Request, res: Response) {
    const { email, password } = req.body;
    const ipAddr = req.ip;
    const emailIPkey = getEmailIPkey(email, ipAddr);

    const isDeviceTrusted = checkDeviceWasUsedPreviously(email, req.cookies?.deviceId);

    const [resEmailAndIP, resSlowByIP, resSlowEmail] = await Promise.all([
      limiterConsecutiveLoginFailsByEmailAndIP.get(emailIPkey),
      limiterSlowBruteByIP.get(ipAddr),
      limiterSlowBruteByEmail.get(email)
    ]);

    let retrySecs = 0;

    // Check if IP, Username + IP or Username is already blocked
    if (
      !isDeviceTrusted &&
      resSlowByIP !== null &&
      resSlowByIP.consumedPoints > maxLoginFailsByIPperDay
    ) {
      retrySecs = Math.round(resSlowByIP.msBeforeNext / 1000) || 1;
    } else if (
      resEmailAndIP !== null &&
      resEmailAndIP.consumedPoints > maxConsecutiveLoginFailsByEmailAndIP
    ) {
      retrySecs = Math.round(resEmailAndIP.msBeforeNext / 1000) || 1;
    } else if (
      !isDeviceTrusted &&
      resSlowEmail !== null &&
      resSlowEmail.consumedPoints > maxLoginFailsByEmailPerDay
    ) {
      retrySecs = Math.round(resSlowEmail.msBeforeNext / 1000) || 1;
    }

    if (retrySecs > 0) {
      res.set('Retry-After', String(retrySecs));
      res.status(429).json({ message: 'Too Many Requests' });
    } else {
      try {
        let user = await this.userRepository.findOne({ where: { email } });
        if (!user) {
          if (!isDeviceTrusted) {
            await limiterSlowBruteByIP.consume(ipAddr);
          }
          res.status(400).json({ message: 'Email or password is incorrect' });
        } else {
          if (!user.verified) {
            return res.status(400).json({
              message:
                'This email has not been verified. Please check your email for a verification link.'
            });
          }

          const isValid = await checkPassword(password, user.password);

          if (isValid) {
            // Generate a random string that will constitute the fingerprint for this user
            const fingerprint = crypto.randomBytes(50).toString('hex');

            // Add the fingerprint in a hardened cookie to prevent Token Sidejacking
            // https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html#token-sidejacking
            const jwt = this.#generateJwt(user, fingerprint);

            // Generate refresh token
            const refreshToken = uuidv4();
            user.refreshToken = sha256(refreshToken);

            setCookie(fingerprint, refreshToken, res);
            await this.userRepository.save(user);

            // Reset on successful login
            if (resEmailAndIP !== null && resEmailAndIP.consumedPoints > 0) {
              await limiterConsecutiveLoginFailsByEmailAndIP.delete(emailIPkey);
            }

            res.status(200).json({
              message: 'User login successfully',
              jwt
            });
          } else {
            // Count failed attempts only for registered users
            const limiterPromises = [limiterConsecutiveLoginFailsByEmailAndIP.consume(emailIPkey)];
            if (!isDeviceTrusted) {
              limiterPromises.push(limiterSlowBruteByEmail.consume(email));
            }
            await Promise.all(limiterPromises);
            res.status(400).json({ message: 'Email or password is incorrect' });
          }
        }
      } catch (err) {
        console.log(err);
        if (err instanceof Error) {
          res.status(400).json({ message: 'Error logging in' });
        } else {
          res.set('Retry-After', String(Math.round(err.msBeforeNext / 1000)) || '1');
          res.status(429).json({ message: 'Too Many Requests' });
        }
      }
    }
  }

  async signup(req: Request, res: Response) {
    const { firstName, lastName, username, email, password } = req.body;

    let user = new User();

    user.firstName = firstName;
    user.lastName = lastName;
    user.username = username;
    user.email = email;
    user.password = await hashPassword(password);
    user.secret = new OTPAuth.Secret().base32;

    // save user to db
    try {
      await this.userRepository.save(user);
    } catch (err) {
      console.log('An error occured while saving user to db', err);
      res.status(400).json({ message: 'Error signing up' });
    }

    // send verification link to email
    try {
      const verificationToken = this.#generateVerificationToken(user);
      const verificationUrl = `${envConfig.BACKEND_URL}/auth/signup/verify/${user.id}/${verificationToken}`;
      await sendVerificationLinkToMail(user, verificationUrl);
    } catch (err) {
      console.log(err);
      return res
        .status(400)
        .json({ message: 'An error occurred while sending verification code to email' });
    }

    return res.status(200).json({
      message: 'Registration successful, please verify your email'
    });
    // return res.status(200).redirect(`${envConfig.CLIENT_URL}/check-your-email`);
  }

  async signupVerify(req: Request, res: Response) {
    try {
      const { id, token } = req.params;

      let user = await this.userRepository.findOne({ where: { id } });

      if (!token || !id)
        return res
          .status(400)
          .redirect(
            `${envConfig.CLIENT_URL}/signup/verify?status=failed&email=${encodeURIComponent(user.email)}`
          );

      if (!user) {
        return res.status(400).json({ message: 'Error verifying' });
      }

      if (user.verified) {
        return res.status(200).redirect(`${envConfig.CLIENT_URL}/signup/verify?status=success`);
      }

      const err = verifyJwt(token, user.id);

      if (err !== null) {
        console.log(err);
        return res
          .status(400)
          .redirect(
            `${envConfig.CLIENT_URL}/signup/verify?status=failed&email=${encodeURIComponent(user.email)}`
          );
      }

      user = { ...user, verified: true };
      await this.userRepository.save(user);
      return res.status(200).redirect(`${envConfig.CLIENT_URL}/signup/verify?status=success`);
    } catch (err) {
      // console.log('An error occurred while verifying:', err);
      return res.status(400).json({ message: 'Error verifying' });
    }
  }

  async signupResend(req: Request, res: Response) {
    const { email } = req.body;

    let user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      return res.status(400).json({ message: 'Wrong email' });
    }

    try {
      const verificationToken = this.#generateVerificationToken(user);
      const verificationUrl = `${envConfig.BACKEND_URL}/auth/verify/email/${user.id}/${verificationToken}`;
      await sendVerificationLinkToMail(user, verificationUrl);
      // return res.status(200).redirect(`${envConfig.CLIENT_URL}/check-your-email`);
      return res.status(200).json({
        message: 'Verification link resent successfully'
      });
    } catch (err) {
      console.log('An error occurred while sending verification token:', err);
      return res
        .status(400)
        .redirect(
          `${envConfig.CLIENT_URL}/verify/email?status=failed&email=${encodeURIComponent(user.email)}`
        );
    }
  }

  async postForgot(req: Request, res: Response) {
    const { email } = req.body;
    let secret: string;

    let user = await this.userRepository.findOne({ where: { email } });

    // user not exist
    if (!user) {
      return res.status(200).json({
        message: 'Verification code sent successfully'
      }); // consistent message to prevent user enumeration attack
    }

    if (!user.secret) {
      secret = new OTPAuth.Secret().base32;
      user.secret = secret;
      await this.userRepository.save(user);
    } else {
      secret = user.secret;
    }

    try {
      // deleting previous incomplete password reset records
      let existingPasswordResets = await this.passwordResetRepository.find({
        where: { email, verified: false }
      });
      await this.passwordResetRepository.remove(existingPasswordResets);

      const totp = generateTOTP(user.email, secret);
      const otp = totp.generate();
      await sendVerificationCodeToMail(user, email, otp);

      let pwResetRecord = new PasswordReset();
      pwResetRecord.email = email;
      pwResetRecord.otp = otp + '';
      pwResetRecord.expiry = String(+Date.now() + 1000 * 30); // 30 secs
      await this.passwordResetRepository.save(pwResetRecord);

      return res.status(200).json({
        message: 'Verification code sent successfully'
      });
    } catch (err) {
      console.log('An error occurred while sending verification token:', err);
      res.status(400).json({ message: 'Error sending verification token' });
    }
  }

  async resetVerify(req: Request, res: Response) {
    const { email, otp } = req.body;

    if (!otp || !email) return res.status(400).json({ message: 'Error verifying' });

    let pwResetRecord = await this.passwordResetRepository.findOne({
      where: { email, verified: false }
    });

    if (!pwResetRecord) {
      return res.status(400).json({ message: 'Error verifying' });
    }

    const resSlowEmail = await limiterSlowBruteOTPVerifyByEmail.get(email);

    let retrySecs = 0;

    if (resSlowEmail !== null && resSlowEmail.consumedPoints > maxWrongOTPVerifyByEmailPerDay) {
      retrySecs = Math.round(resSlowEmail.msBeforeNext / 1000) || 1;
    }

    if (retrySecs > 0) {
      res.set('Retry-After', String(retrySecs));
      res.status(429).json({ message: 'Too Many Requests' });
    } else {
      try {
        // otp matched
        if (pwResetRecord && pwResetRecord.otp == otp) {
          if (Date.now() > parseInt(pwResetRecord.expiry, 10)) {
            return res.status(400).json({ message: 'expired' });
          }

          pwResetRecord.verified = true;
          await this.passwordResetRepository.save(pwResetRecord);

          // Reset on successful attempt
          if (resSlowEmail !== null && resSlowEmail.consumedPoints > 0) {
            await limiterSlowBruteOTPVerifyByEmail.delete(email);
          }

          return res.status(200).json({ message: 'success', id: pwResetRecord.id });
        } else {
          await limiterSlowBruteOTPVerifyByEmail.consume(email);
          return res.status(400).json({
            message: `Wrong OTP. You have ${maxWrongOTPVerifyByEmailPerDay - (resSlowEmail?.consumedPoints || 0) - 1} more tries.`
          });
        }
      } catch (err) {
        if (err instanceof Error) {
          console.log('An error occurred while verifying:', err);
          res.status(400).json({ message: 'Error verifying' });
        } else {
          res.set('Retry-After', String(Math.round(err.msBeforeNext / 1000)) || '1');
          res.status(429).json({ message: 'Too Many Requests' });
        }
      }
    }
  }

  async resetPassword(req: Request, res: Response) {
    const { id, password } = req.body;

    let pwResetRecord = await this.passwordResetRepository.findOne({ where: { id } });

    if (!pwResetRecord || !pwResetRecord.verified) {
      return res.status(400).json({ message: 'Not verified' });
    }

    // completed record is not allowed to update
    if (pwResetRecord.completedAt) {
      return res.status(400).json({ message: 'Error resetting password' });
    }

    let user = await this.userRepository.findOne({ where: { email: pwResetRecord.email } });

    user.password = await hashPassword(password);

    try {
      pwResetRecord.completedAt = new Date(Date.now());
      await this.passwordResetRepository.save(pwResetRecord);
      await this.userRepository.save(user);
      res.status(200).json({ message: 'success' });
    } catch (err) {
      console.log('An error occured while updating password', err);
      res.status(400).json({ message: 'Error resetting password' });
    }
  }

  async updateToken(req: Request, res: Response) {
    if (!req.cookies) {
      return res.status(400).json({ message: 'Unable to refresh JWT token' });
    }

    const refreshToken = req.cookies[REFRESH_TOKEN_COOKIE_NAME];
    const fingerprintCookie = req.cookies[FINGERPRINT_COOKIE_NAME];

    console.log({ refreshToken, fingerprintCookie });

    if (!fingerprintCookie || !refreshToken) {
      return res.status(400).json({ message: 'Unable to refresh JWT token' });
    }

    return this.userRepository
      .findOne({ where: { refreshToken: sha256(refreshToken) } })
      .then((user) => {
        if (!user) {
          return res.status(400).json({ message: 'User not found' });
        }

        // Generate a random string that will constitute the fingerprint for this user
        const fingerprint = crypto.randomBytes(50).toString('hex');

        // Generate refresh token
        const refreshToken = uuidv4();
        user.refreshToken = sha256(refreshToken);

        setCookie(fingerprint, refreshToken, res);

        const jwt = this.#generateJwt(user, fingerprint);

        console.log(__filename, { fingerprint, refreshToken, jwt });

        return this.userRepository.save(user).then(() => {
          return res.status(200).json({ jwt });
        });
      })
      .catch((err) => {
        console.log(err);
        return res.status(400).json({ message: 'Error issuing jwt token refresh' });
      });
  }

  async signout(req: Request, res: Response) {
    res.clearCookie(FINGERPRINT_COOKIE_NAME, { path: '/' });
    res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, { path: '/' });
    return res.status(200).json({ message: 'success' });
  }

  #generateJwt(user: User, fingerprint: string) {
    return generateJwt({
      sub: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      otherClaims: {
        avatar: user.avatar,
        fingerprint: sha256(fingerprint)
      }
    });
  }

  #generateVerificationToken(user: User) {
    return generateJwt({
      sub: user.id,
      // email: user.email,
      expiresIn: '5m'
    });
  }
}
