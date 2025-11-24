import { redisClient } from '../utils/handleGetRepository';

export const storeToken = async (userId: string, token: string | number, expireIn: number) => {
  try {
    // store the token in Redis and will expires in 10-mins
    await redisClient.setex(`verifyToken:${userId}`, expireIn, token);
  } catch (err) {
    console.log('Something went wrong while storing token:', err);
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
