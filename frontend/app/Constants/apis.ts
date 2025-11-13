export const baseURL = import.meta.env.VITE_PUBLIC_MOSAIC_BACKEND_URL;

export const guitarListURL = baseURL + '/guitar/list';

export const registerURL = baseURL + '/auth/register';
export const verifyEmailUrl = baseURL + '/auth/verify';
export const resendVerificationMailURL = baseURL + '/auth/resend-verification/email';
export const loginURL = baseURL + '/auth/login';
export const refreshTokenURL = baseURL + '/auth/refresh-token';

export const getUserURL = baseURL + `/user`;
export const updateUserURL = baseURL + `/user/update`;
