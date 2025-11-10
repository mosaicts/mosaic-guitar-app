let crypto = require('crypto');
import * as jwt from 'jsonwebtoken';
import envConfig from '../config/envConfig';
import type { StringValue } from 'ms';

export function sha256(value: string) {
  return crypto.createHash('sha256').update(value, 'utf8').digest('hex');
}

interface GenerateJWTParams {
  expiresIn?: StringValue;
  otherClaims?: Record<string, string>;
}

export function generateJwt(params: GenerateJWTParams) {
  const payload = {
    iat: Date.now(),
    ...params.otherClaims
  };

  return jwt.sign(payload, envConfig.JWT_SECRET, {
    algorithm: 'RS256',
    expiresIn: params.expiresIn || '1h'
  });
}
