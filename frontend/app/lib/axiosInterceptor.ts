import axios, { type AxiosError, type AxiosResponse } from 'axios';
import { getJwt, getFingerprintHash } from './auth';

export const axiosInstance = axios.create();

axiosInstance.interceptors.response.use(
  async (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      try {
        // console.log('refresh token');
        // const response = await refreshTokenApi();
        // const jwt = response.data.jwt;
        // console.log({ jwt });
        // storeJwt(jwt);
        // console.log('token refreshed');

        const jwt = getJwt();
        const fingerprintHash = getFingerprintHash(jwt);

        error.response.config.headers['Authorization'] = 'Bearer ' + jwt;
        const data = JSON.parse(error.response.config.data);
        error.response.config.data = { ...data, fingerprintHash };

        return axiosInstance(error.response.config);
      } catch (error) {
        console.log(error);
      }
    }

    return Promise.reject(error);
  }
);
