let crypto = require('crypto');
import * as jwt from 'jsonwebtoken';
import envConfig from '../config/envConfig';
import type { StringValue } from 'ms';

export const sha256 = (value: string) => {
  return crypto.createHash('sha256').update(value, 'utf8').digest('hex');
};

interface GenerateJWTParams {
  sub: StringValue;
  username?: StringValue;
  firstName?: StringValue;
  lastName?: StringValue;
  email?: StringValue;
  role?: StringValue;
  expiresIn?: StringValue;
  otherClaims?: Record<string, string>;
}

export const generateJwt = (params: GenerateJWTParams) => {
  const payload = {
    iat: Date.now(),
    ...params
  };

  return jwt.sign(payload, envConfig.PRIV_KEY, {
    algorithm: 'RS256',
    expiresIn: params.expiresIn || '5m'
  });
};

export const verifyJwt = (token: string) => {
  return jwt.verify(token, envConfig.PUB_KEY, { algorithms: ['RS256'] }, (err) => {
    return err;
  });
};
