import { Request, Response } from 'express';
import { Repository } from 'typeorm';
const crypto = require('crypto');
import envConfig from '../config/envConfig';

import { checkPassword, hashPassword } from '../lib/password';
import {
  setFingerprintCookieAndSignJwt,
  FINGERPRINT_COOKIE_NAME
} from '../lib/setFingerprintCookieAndSignJwt';
import { generateJwt, sha256, verifyJwt } from '../lib/jwt';
import { generateOTP, uuidv4 } from '../lib/auth';
import { parse } from 'cookie';
import {
  maxConsecutiveLoginFailsByEmailAndIP,
  maxWrongAttemptsByIPperDay,
  maxWrongAttemptsByEmailPerDay,
  maxWrongOTPVerifyAttemptsByEmailPerDay,
  limiterConsecutiveLoginFailsByEmailAndIP,
  limiterSlowBruteByIP,
  limiterSlowBruteByEmail,
  limiterSlowBruteOTPVerifyByEmail,
  getEmailIPkey,
  checkDeviceWasUsedPreviously
} from '../config/rateLimiter';
import { User } from '../entities/User.postgres';
import { sendVerificationLinkToMail, sendVerificationCodeToMail } from '../config/emailTransporter';
import { searchAndFindToken, storeToken } from '../utils/tokenService';

export class AuthService {
  constructor(private readonly userRepository: Repository<User>) {}

  async protected(res: Response) {
    res.status(200).json({
      message: 'You are successfully authenticated to this route!'
    });
  }

  async register(req: Request, res: Response) {
    const { firstName, lastName, username, email, password } = req.body;

    const user = new User();

    user.firstName = firstName;
    user.lastName = lastName;
    user.username = username;
    user.email = email;
    user.password = await hashPassword(password);
    user.profilePicUrl = '';

    this.#generateRefreshToken(user);

    // save user to db
    try {
      await this.userRepository.save(user);
    } catch (err) {
      console.log('An error occured while saving user to db', err);
      res.status(400).json({ message: 'Error signing up' });
    }

    // send verification link to email
    try {
      await this.#sendVerificationLinkToEmail(user);
    } catch (err) {
      return res
        .status(400)
        .json({ message: 'An error occurred while sending verification code to email' });
    }

    res.status(200).json({
      message: 'Registration successful, please verify your email'
    });
    // return res.status(200).redirect(`${envConfig.CLIENT_URL}/check-your-email`);
  }

  async verifyEmail(req: Request, res: Response) {
    try {
      const { id, token } = req.params;

      let user = await this.userRepository.findOne({ where: { id } });

      if (!token || !id)
        return res
          .status(400)
          .redirect(
            `${envConfig.CLIENT_URL}/verify/email?status=failed&email=${encodeURIComponent(user.email)}`
          );

      if (user.verified) {
        return res.status(200).redirect(`${envConfig.CLIENT_URL}/verify/email?status=success`);
      }

      const err = verifyJwt(token);

      if (err !== null) {
        return res
          .status(400)
          .redirect(
            `${envConfig.CLIENT_URL}/verify/email?status=failed&email=${encodeURIComponent(user.email)}`
          );
      }

      user = { ...user, verified: true };
      await this.userRepository.save(user);
      return res.status(200).redirect(`${envConfig.CLIENT_URL}/verify/email?status=success`);
    } catch (err) {
      console.log('An error occurred while verifying:', err);
    }
  }

  async verifyOTP(req: Request, res: Response) {
    const { email, pin } = req.body;

    const resSlowEmail = await limiterSlowBruteOTPVerifyByEmail.get(email);

    let retrySecs = 0;

    if (
      resSlowEmail !== null &&
      resSlowEmail.consumedPoints > maxWrongOTPVerifyAttemptsByEmailPerDay
    ) {
      retrySecs = Math.round(resSlowEmail.msBeforeNext / 1000) || 1;
    }

    if (retrySecs > 0) {
      res.set('Retry-After', String(retrySecs));
      res.status(429).send('Too Many Requests');
    } else {
      try {
        if (!email || email === 'null' || !pin)
          return res.status(400).json({ message: 'Missing credentials' });

        const otp = await searchAndFindToken(email);

        if (otp === pin) {
          return res.status(200).json({ message: 'success' });
        } else {
          await limiterSlowBruteOTPVerifyByEmail.consume(email);
          return res.status(400).json({
            message: `Wrong OTP. You have ${maxWrongOTPVerifyAttemptsByEmailPerDay - (resSlowEmail?.consumedPoints || 0) - 1} more tries.`
          });
        }
      } catch (err) {
        if (err instanceof Error) {
          console.log('An error occurred while verifying:', err);
          res.status(400).json({ message: 'Error logging in' });
        } else {
          res.set('Retry-After', String(Math.round(err.msBeforeNext / 1000)) || '1');
          res.status(429).send('Too Many Requests');
        }
      }
    }
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
      resSlowByIP.consumedPoints > maxWrongAttemptsByIPperDay
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
      resSlowEmail.consumedPoints > maxWrongAttemptsByEmailPerDay
    ) {
      retrySecs = Math.round(resSlowEmail.msBeforeNext / 1000) || 1;
    }

    if (retrySecs > 0) {
      res.set('Retry-After', String(retrySecs));
      res.status(429).send('Too Many Requests');
    } else {
      try {
        const user = await this.userRepository.findOne({ where: { email } });
        if (!user) {
          if (!isDeviceTrusted) {
            await limiterSlowBruteByIP.consume(ipAddr);
          }
          res.status(400).json({ message: 'Email or password is not correct' });
        } else {
          if (!user.verified) {
            return res.status(400).json({
              message:
                'This email has not been verified. Please check your email for a verification link.'
            });
          }

          const isValid = await checkPassword(password, user.password);

          if (isValid) {
            const jwt = this.#issueJwt(res, user);
            const refreshToken = this.#generateRefreshToken(user);

            await this.userRepository.save(user);

            // Reset on successful login
            if (resEmailAndIP !== null && resEmailAndIP.consumedPoints > 0) {
              await limiterConsecutiveLoginFailsByEmailAndIP.delete(emailIPkey);
            }

            res.status(200).json({
              message: 'User login successfully',
              jwt,
              refreshToken,
              user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                username: user.username,
                email: user.email,
                profilePicUrl: user.profilePicUrl
              }
            });
          } else {
            // Count failed attempts only for registered users
            const limiterPromises = [limiterConsecutiveLoginFailsByEmailAndIP.consume(emailIPkey)];
            if (!isDeviceTrusted) {
              limiterPromises.push(limiterSlowBruteByEmail.consume(email));
            }
            await Promise.all(limiterPromises);
            res.status(400).json({ message: 'Email or password is not correct' });
          }
        }
      } catch (err) {
        console.log(err);
        if (err instanceof Error) {
          res.status(400).json({ message: 'Error logging in' });
        } else {
          res.set('Retry-After', String(Math.round(err.msBeforeNext / 1000)) || '1');
          res.status(429).send('Too Many Requests');
        }
      }
    }
  }

  async sendVerificationLink(req: Request, res: Response) {
    const { email } = req.body;

    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      return res.status(400).json({ message: 'Wrong email' });
    }

    try {
      await this.#sendVerificationLinkToEmail(user);
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

  async sendVerificationOTP(req: Request, res: Response) {
    const { email } = req.body;

    const user = await this.userRepository.findOne({ where: { email } });

    try {
      await this.#sendVerificationOTPToEmail(user, email);
      // return res.status(200).redirect(`${envConfig.CLIENT_URL}/check-your-email`);
      return res.status(200).json({
        message: 'Verification code resent successfully'
      });
    } catch (err) {
      console.log('An error occurred while sending verification token:', err);
    }
  }

  async resetPassword(req: Request, res: Response) {
    const { email, password } = req.body;
    console.log('Email:', email);

    const user = await this.userRepository.findOne({ where: { email } });

    user.password = await hashPassword(password);

    // save user to db
    try {
      await this.userRepository.save(user);
      res.status(200).json({ message: 'success' });
    } catch (err) {
      console.log('An error occured while saving user to db', err);
      res.status(400).json({ message: 'Error updating password' });
    }
  }

  async refreshJwt(req: Request, res: Response) {
    const { refreshToken, fingerprintHash } = req.params;

    const fingerprintCookie = parse(req.headers.cookie)[FINGERPRINT_COOKIE_NAME];
    console.log({ fingerprintCookie });
    if (!fingerprintCookie) res.status(400).json({ message: 'Unable to refresh JWT token' });

    // Compute a SHA256 hash of the received fingerprint in cookie in order to compare
    // it to the fingerprint hash stored in the token
    const fingerprintCookieHash = sha256(fingerprintCookie);
    console.log({ fingerprintCookie, fingerprintCookieHash, fingerprintHash });

    if (fingerprintHash != fingerprintCookieHash) {
      res.status(400).json({ message: 'Unable to refresh JWT token' });
    }

    return this.userRepository
      .findOne({ where: { refreshToken } })
      .then((user) => {
        if (!user) {
          res.status(400).json({ message: 'User not found' });
        }

        this.#generateRefreshToken(user);
        const jwt = generateJwt({
          expiresIn: '5m',
          otherClaims: {
            'X-User-Id': String(user.id)
            // TODO: why not hashing fingerprint
          }
        });
        res.status(200).json({ jwt });
      })
      .catch((err) => {
        console.log(err);
        res.status(400).json({ message: 'Error issuing jwt token refresh' });
      });
  }

  #sendVerificationLinkToEmail = async (user: User) => {
    // send verification code to email
    const verificationToken = this.#generateVerificationToken(user);
    const verificationUrl = `${envConfig.BACKEND_URL}/auth/verify/email/${user.id}/${verificationToken}`;
    try {
      await sendVerificationLinkToMail(user, verificationUrl);
    } catch (err) {
      console.log(err);
    }
  };

  #sendVerificationOTPToEmail = async (user: User, email: string) => {
    // send verification code to email
    const verificationOTP = generateOTP();
    await storeToken(email, verificationOTP, 60);
    try {
      await sendVerificationCodeToMail(user, email, verificationOTP);
    } catch (err) {
      console.log(err);
    }
  };

  #generateRefreshToken(user: User) {
    const refreshToken = uuidv4();
    user.refreshToken = refreshToken;
    user.refreshTokenExpiresAt = new Date(Date.now() + 1000 * 60 * 60 * 1); // 1 hour
    return refreshToken;
  }

  #generateVerificationToken(user: User) {
    const verificationToken = generateJwt({
      expiresIn: '5m',
      otherClaims: {
        'X-User-Id': String(user.id),
        'X-User-Email': user.email
      }
    });
    return verificationToken;
  }

  #issueJwt(res: Response, user: User) {
    // Generate a random string that will constitute the fingerprint for this user
    const fingerprint = crypto.randomBytes(50).toString('hex');

    // Add the fingerprint in a hardened cookie to prevent Token Sidejacking
    // https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html#token-sidejacking
    const jwt = setFingerprintCookieAndSignJwt(fingerprint, res, user);
    return jwt;
  }
}
