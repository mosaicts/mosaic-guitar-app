import { Request, Response } from 'express';
import { Repository } from 'typeorm';
const crypto = require('crypto');
import envConfig from '../config/envConfig';

import { checkPassword, hashPassword } from '../lib/password';
import {
  setFingerprintCookieAndSignJwt,
  FINGERPRINT_COOKIE_NAME
} from '../lib/setFingerprintCookieAndSignJwt';
import { generateJwt, sha256 } from '../lib/jwt';
import { uuidv4 } from '../lib/auth';
import { parse } from 'cookie';
import {
  maxWrongAttemptsByIPperDay,
  maxConsecutiveFailsByUsernameAndIP,
  limiterConsecutiveFailsByUsernameAndIP,
  limiterSlowBruteByIP,
  getUsernameIPkey
} from '../config/rateLimiter';
import { User } from '../entities/User.postgres';
import { sendVerificationMail } from '../config/emailTransporter';

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

    // send verification code to email
    const verificationToken = this.#generateVerificationToken(user);
    const verificationUrl = `${envConfig.CLIENT_URL}/verify-email?email=${user.email}&token=${verificationToken}`;

    try {
      await sendVerificationMail(user, verificationUrl);
    } catch (err) {
      console.log(err);
      return res.status(400).json({ message: 'An error occurred' });
    }

    // save user to db
    try {
      await this.userRepository.save(user);
    } catch (err) {
      console.log('/auth/register endpoint error', err);
      res.status(400).json({ message: 'Error signing up' });
    }

    res.status(200).json({
      message: 'Registration successful, please verify your email'
    });
  }

  async verify(req: Request, res: Response) {
    const { token } = req.body;
    try {
      let user = await this.userRepository.findOne({ where: { verificationToken: token } });
      if (!user) {
        return res.status(400).json({
          message: 'Token expired'
        });
      } else if (user.verified) {
        return res.status(200).json({ message: 'User already verified' });
      }

      user = { ...user, verificationToken: null, verified: true };
      await this.userRepository.save(user);
      res.status(200).json({ message: 'Email verified successfully' });
    } catch (err) {
      res.status(400).json({
        message: 'An error occurred'
      });
    }
  }

  async login(req: Request, res: Response) {
    const { email, password } = req.body;
    const ipAddr = req.ip;
    const usernameIPkey = getUsernameIPkey(email, ipAddr);

    const [resUsernameAndIP, resSlowByIP] = await Promise.all([
      limiterConsecutiveFailsByUsernameAndIP.get(usernameIPkey),
      limiterSlowBruteByIP.get(ipAddr)
    ]);

    let retrySecs = 0;

    // Check if IP or Username + IP is already blocked
    if (resSlowByIP !== null && resSlowByIP.consumedPoints > maxWrongAttemptsByIPperDay) {
      retrySecs = Math.round(resSlowByIP.msBeforeNext / 1000) || 1;
    } else if (
      resUsernameAndIP !== null &&
      resUsernameAndIP.consumedPoints > maxConsecutiveFailsByUsernameAndIP
    ) {
      retrySecs = Math.round(resUsernameAndIP.msBeforeNext / 1000) || 1;
    }

    if (retrySecs > 0) {
      res.set('Retry-After', String(retrySecs));
      res.status(429).send('Too Many Requests');
    } else {
      try {
        const user = await this.userRepository.findOne({ where: { email } });
        if (!user) {
          await limiterSlowBruteByIP.consume(ipAddr);
          res.status(400).json({ message: 'Email or password is not correct' });
        } else {
          // if (!user.verified) {
          //   return res.status(400).json({ message: 'This email has not been verified' });
          // }
          const isValid = await checkPassword(password, user.password);
          if (isValid) {
            const jwt = this.#issueJwt(res, user);
            const refreshToken = this.#generateRefreshToken(user);

            await this.userRepository.save(user);

            // Reset on successful login
            if (resUsernameAndIP !== null && resUsernameAndIP.consumedPoints > 0) {
              await limiterConsecutiveFailsByUsernameAndIP.delete(usernameIPkey);
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
            // username exists but not logged in
            await Promise.all([
              limiterSlowBruteByIP.consume(ipAddr),
              limiterConsecutiveFailsByUsernameAndIP.consume(usernameIPkey)
            ]);
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

  generateRefreshToken(user: User) {
    const refreshToken = uuidv4();
    user.refreshToken = refreshToken;
    user.refreshTokenExpiresAt = new Date(Date.now() + 1000 * 60 * 60 * 1); // 1 hour
    return refreshToken;
  }

  issueJwt(res: Response, user: User) {
  #generateVerificationToken(user: User) {
    const verificationToken = generateJwt({
      expiresIn: '5m',
      otherClaims: {
        'X-User-Id': String(user.id),
        'X-User-Email': user.email
      }
    });
    user.verificationToken = verificationToken;
    return verificationToken;
  }

    // Generate a random string that will constitute the fingerprint for this user
    const fingerprint = crypto.randomBytes(50).toString('hex');

    // Add the fingerprint in a hardened cookie to prevent Token Sidejacking
    // https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html#token-sidejacking
    const jwt = setFingerprintCookieAndSignJwt(fingerprint, res, user);
    return jwt;
  }
}
