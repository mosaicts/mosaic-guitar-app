import axios from 'axios';
import {
  baseURL,
  guitarListURL,
  loginURL,
  getUserURL,
  updateUserURL,
  registerURL,
  refreshTokenURL,
  verifyEmailUrl
} from '../Constants/apis';
import { type Guitar } from './models';

export async function fetchGuitars() {
  const response = await axios.get(guitarListURL, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
  return response.data.products as Guitar[];
}

export async function fetchSingleGuitar(id: number) {
  const response = await axios.get(`${baseURL}/guitar/${id}`, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
  return response.data.product as Guitar;
}

export async function login(data: object) {
  const response = await axios.post(loginURL, data, {
    headers: {
      'Content-Type': 'application/json'
    },
    withCredentials: true
  });
  return response;
}

export async function getUser(data: object) {
  const response = await axios.post(getUserURL, data, {
    headers: {
      'Content-Type': 'application/json'
    },
    withCredentials: true
  });
  return response;
}

export async function updateUser(data: object) {
  const response = await axios.post(updateUserURL, data, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
  return response;
}

export async function register(data: object) {
  const response = await axios.post(registerURL, data, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
  return response;
}

export async function verifyEmail(data: object) {
  const response = await axios.post(verifyEmailUrl, data, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
  return response;
}

export async function refreshJwt(refreshToken: string, fingerprintHash: string) {
  const response = await axios.post(
    refreshTokenURL,
    {
      fingerprintHash,
      refreshToken
    },
    {
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
  return response;
}
