export const baseURL = import.meta.env.VITE_PUBLIC_MOSAIC_BACKEND_URL;

export const guitarListURL = baseURL + '/guitar/list';
export const singleGuitarURL = baseURL + '/guitar';

export const loginURL = baseURL + '/auth/login';
export const facebookSigninURL = baseURL + '/auth/facebook';
export const googleSigninURL = baseURL + '/auth/google';

export const signupURL = baseURL + '/auth/signup';
export const signupVerifyURL = baseURL + '/auth/signup/verify';
export const signupResendURL = baseURL + '/auth/signup/resend';

export const forgotPasswordURL = baseURL + '/auth/forgot';
export const resetVerifyURL = baseURL + '/auth/forgot/verify';
export const resetPasswordURL = baseURL + '/auth/forgot/reset';

export const refreshTokenURL = baseURL + '/auth/token';
export const signoutURL = baseURL + '/auth/signout';

export const getProfileURL = baseURL + `/user/profile`;
export const updateUserURL = baseURL + `/user/update`;
