import axios from 'axios';
import {
  baseURL,
  getProfileURL,
  updateUserURL,
  loginURL,
  signupURL,
  signupVerifyURL,
  signupResendURL,
  forgotPasswordURL,
  resetVerifyURL,
  resetPasswordURL,
  refreshTokenURL,
  guitarListURL
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

export async function getProfile(data: object) {
  const response = await axios.post(getProfileURL, data, {
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
    },
    withCredentials: true
  });
  return response;
}

export async function loginApi(data: object) {
  const response = await axios.post(loginURL, data, {
    headers: {
      'Content-Type': 'application/json'
    },
    withCredentials: true
  });
  return response;
}

export async function signup(data: object) {
  const response = await axios.post(signupURL, data, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
  return response;
}

export async function signupVerify(data: object) {
  const response = await axios.post(signupVerifyURL, data, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
  return response;
}

export async function signupResend(data: object) {
  const response = await axios.post(signupResendURL, data, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
  return response;
}

export async function postForgot(data: object) {
  const response = await axios.post(forgotPasswordURL, data, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
  return response;
}

export async function resetVerify(data: object) {
  const response = await axios.post(resetVerifyURL, data, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
  return response;
}

export async function resetPassword(data: object) {
  const response = await axios.post(resetPasswordURL, data, {
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
