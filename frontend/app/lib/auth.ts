export function getJwt() {
  if (typeof window === 'undefined') return '';
  return window.sessionStorage.getItem('jwt') || '';
}

export function storeJwt(token: string) {
  if (typeof window !== 'undefined') {
    console.log('set jwt to session storage');
    window.sessionStorage.setItem('jwt', token);
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
    return {};
  }
}
