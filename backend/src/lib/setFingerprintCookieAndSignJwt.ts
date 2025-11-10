import { generateJwt, sha256 } from './jwt';
import { serialize } from 'cookie';
import { Response } from 'express';
import { User } from '../entities/User.postgres';
import envConfig from '../config/envConfig';

export const FINGERPRINT_COOKIE_NAME = '__User-Fgp';
export const FINGERPRINT_COOKIE_MAX_AGE = 60 * 60 * 8; // 8 hours

export function setFingerprintCookieAndSignJwt(fingerprint: string, res: Response, user: User) {
  res.setHeader(
    'Set-Cookie',
    serialize(FINGERPRINT_COOKIE_NAME, fingerprint, {
      path: '/',
      maxAge: FINGERPRINT_COOKIE_MAX_AGE,
      httpOnly: true,
      // sameSite: "strict",        // TODO: config this
      secure: envConfig.NODE_ENV === 'production',
      partitioned: envConfig.NODE_ENV === 'production'
    })
  );

  return generateJwt({
    expiresIn: '5m',
    otherClaims: {
      'X-User-Id': String(user.id),
      'X-User-Fingerprint': sha256(fingerprint)
    }
  });
}
