export function getJwt() {
  return sessionStorage.getItem('jwt') || '';
}

export function storeJwt(token: string) {
  sessionStorage.setItem('jwt', token);
}

export function getFingerprintHash(jwt: string) {
  const parsedJwt = jwt ? parseJwt(jwt as string) : {};
  const fingerprintHash = parsedJwt?.['X-User-Fingerprint'];
  return fingerprintHash;
}

export function parseJwt(token: string) {
  var base64Url = token.split('.')[1];
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
}
