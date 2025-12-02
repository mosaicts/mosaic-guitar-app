import axios, { type AxiosError, type AxiosResponse } from 'axios';
import { getJwt, storeJwt, parseJwt } from './auth';
import { refreshTokenApi } from '@/utils/apis';

export const axiosInstance = axios.create();

axiosInstance.interceptors.response.use(
  async (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      console.log('refresh token');

      try {
        const response = await refreshTokenApi();
        const jwt = response.data.jwt;
        storeJwt(jwt);

        const parsedJwt = parseJwt(jwt as string);
        const fingerprintHash = parsedJwt?.['X-User-Fingerprint'];

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
