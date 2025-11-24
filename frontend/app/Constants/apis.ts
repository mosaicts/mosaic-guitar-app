export const baseURL = import.meta.env.VITE_PUBLIC_MOSAIC_BACKEND_URL;

export const guitarListURL = baseURL + '/guitar/list';

export const loginURL = baseURL + '/auth/login';
export const registerURL = baseURL + '/auth/register';
export const verifyEmailUrl = baseURL + '/auth/verify/link';
export const sendVerificationLinkURL = baseURL + '/auth/send-verification/email/link';
export const sendVerificationOTPURL = baseURL + '/auth/send-verification/email/otp';
export const refreshTokenURL = baseURL + '/auth/refresh-token';

export const getUserURL = baseURL + `/user`;
export const updateUserURL = baseURL + `/user/update`;
