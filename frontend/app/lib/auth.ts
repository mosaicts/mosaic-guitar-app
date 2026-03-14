import { type User } from '@/utils/models';

export function getJwt() {
  if (typeof window === 'undefined') {
    return '';
  }
  const jwt = window.sessionStorage.getItem('jwt');
  return jwt || '';
}

export function storeJwt(token: string) {
  if (typeof window !== 'undefined') {
    console.log('set jwt to session storage');
    window.sessionStorage.setItem('jwt', token);
  } else {
    console.log('window is not set');
  }
}

export function getFingerprintHash(jwt: string) {
  const parsedJwt = jwt != undefined ? parseJwt(jwt) : {};
  const fingerprintHash = parsedJwt.otherClaims?.['fingerprint'];
  return fingerprintHash;
}

export function parseJwt(token: string) {
  var base64Url = token.split('.')[1];
  try {
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (err) {
    console.log(err);
    return {};
  }
}

export function parseUser(data: any) {
  const { id, firstName, lastName, username, email, avatar, role, ...rest } = data;
  return { id, firstName, lastName, username, email, avatar, role };
}

export function parseUserDataFromJwt(token: string, initialData: User) {
  const userInfo = parseJwt(token);
  try {
    const { otherClaims, ...rest } = userInfo;
    const { sub: id, firstName, lastName, username, email, role } = rest;
    return { id, firstName, lastName, username, email, avatar: otherClaims.avatar, role };
  } catch (err) {
    console.log(err);
    return initialData;
  }
}
