import { CookieOptions, Response } from 'express';
import envConfig from '../config/envConfig';

export const FINGERPRINT_COOKIE_NAME = '__User-Fgp';
export const FINGERPRINT_COOKIE_MAX_AGE = 1000 * 60 * 60 * 8; // 8 hours
export const REFRESH_TOKEN_COOKIE_NAME = '__Refresh-Token';
export const REFRESH_TOKEN_COOKIE_MAX_AGE = 1000 * 60 * 60 * 8; // 8 hours

const fingerprintCookieConfig: CookieOptions = {
  path: '/',
  maxAge: FINGERPRINT_COOKIE_MAX_AGE,
  httpOnly: true,
  // sameSite: "strict",        // TODO: config this
  secure: envConfig.NODE_ENV === 'production',
  partitioned: envConfig.NODE_ENV === 'production'
};

const refreshTokenCookieConfig: CookieOptions = {
  path: '/',
  maxAge: REFRESH_TOKEN_COOKIE_MAX_AGE,
  httpOnly: true,
  // sameSite: "strict",        // TODO: config this
  secure: envConfig.NODE_ENV === 'production',
  partitioned: envConfig.NODE_ENV === 'production'
};

export function setCookie(fingerprint: string, refreshToken: string, res: Response) {
  res.cookie(FINGERPRINT_COOKIE_NAME, fingerprint, fingerprintCookieConfig);
  res.cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, refreshTokenCookieConfig);
}
