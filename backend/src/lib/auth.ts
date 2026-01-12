import crypto from 'crypto';
import * as OTPAuth from 'otpauth';

export const uuidv4 = (): string => {
  // @ts-ignore
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
    // @ts-ignore
    (c ^ (crypto.webcrypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)
  );
};

export const generateTOTP = (email: string, secret?: string) => {
  const totp = new OTPAuth.TOTP({
    // Provider or service the account is associated with.
    issuer: 'mosaic.com',
    // Account identifier.
    label: email,
    // Algorithm used for the HMAC function, possible values are:
    //   "SHA1", "SHA224", "SHA256", "SHA384", "SHA512",
    //   "SHA3-224", "SHA3-256", "SHA3-384" and "SHA3-512".
    algorithm: 'SHA512',
    // Length of the generated tokens.
    digits: 6,
    // Interval of time for which a token is valid, in seconds.
    period: 30,
    // Arbitrary key encoded in base32 or `OTPAuth.Secret` instance
    // (if omitted, a cryptographically secure random secret is generated).
    secret: secret ? OTPAuth.Secret.fromBase32(secret) : new OTPAuth.Secret()
    // secret: new OTPAuth.Secret()
    //   or: `OTPAuth.Secret.fromBase32("US3WHSG7X5KAPV27VANWKQHF3SH3HULL")`
    //   or: `new OTPAuth.Secret()`
  });

  return totp;
};
