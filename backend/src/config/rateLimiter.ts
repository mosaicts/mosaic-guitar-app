import { redisClient } from '../utils/handleGetRepository';
import { RateLimiterRedis } from 'rate-limiter-flexible';

export const maxWrongAttemptsByIPperDay = 100;
export const maxConsecutiveLoginFailsByEmailAndIP = 10;
export const maxWrongOTPVerifyAttemptsByEmailPerDay = 5;
export const maxWrongAttemptsByEmailPerDay = 50;

export const limiterSlowBruteByIP = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: 'login_fail_ip_per_day',
  points: maxWrongAttemptsByIPperDay,
  duration: 60 * 60 * 24,
  blockDuration: 60 * 60 * 24 // Block for 1 day, if 100 wrong attempts per day
});

export const limiterConsecutiveLoginFailsByEmailAndIP = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: 'login_fail_consecutive_email_and_ip',
  points: maxConsecutiveLoginFailsByEmailAndIP,
  duration: 60 * 60 * 24 * 90, // Store number for 90 days since first fail
  blockDuration: 60 * 60 * 24 * 365 * 20 // Block for infinity after consecutive fails
});

export const limiterSlowBruteOTPVerifyByEmail = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: 'otp_verify_fail_email_per_day',
  points: maxWrongOTPVerifyAttemptsByEmailPerDay,
  duration: 60 * 60 * 24,
  blockDuration: 60 * 60 * 24 * 365 * 20 // Block for infinity
});

export const limiterSlowBruteByEmail = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: 'login_fail_email_per_day',
  points: maxWrongAttemptsByEmailPerDay,
  duration: 60 * 60 * 24,
  blockDuration: 60 * 60 * 24 * 365 * 20 // Block for infinity after 100 fails
});

export const getEmailIPkey = (email: string, ip: string) => `${email}_${ip}`;

export const checkDeviceWasUsedPreviously = (email: string, deviceId: string): boolean => {
  // TODO
  return false;
};
