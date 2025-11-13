import { redisClient } from '../data-source';
import { generateJwt, sha256 } from '../lib/jwt';
import { User } from '../entities/User.postgres';

export const generateAndStoreToken = async (user: User) => {
  try {
    const token = generateJwt({
      expiresIn: '5m',
      otherClaims: {
        'X-User-Id': String(user.id),
        'X-User-Email': user.email
      }
    });
    // store the token in Redis and will expires in 10-mins
    await redisClient.setex(`verifyToken:${user.id}`, 60 * 10, token);

    return token;
  } catch (err) {
    console.log('Something went wrong while generating token:', err);
  }
};

export const searchAndFindToken = async (userId: string) => {
  try {
    const token = await redisClient.get(`verifyToken:${userId}`);
    return token;
  } catch (err) {
    console.log('Something went wrong while verifying token:', err);
  }
};

export const deleteToken = async (userId: string) => {
  try {
    await redisClient.del(`verifyToken:${userId}`);
    console.log('token deleted');
  } catch (err) {
    console.log('Something went wrong while deleting token:', err);
  }
};
