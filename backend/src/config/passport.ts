import { Request } from 'express';
import { User } from '../entities/User.postgres';
import { sha256 } from '../lib/jwt';
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
import fs = require('fs');
import path = require('path');
import { Payload } from '../dto/user.dto';
import { FINGERPRINT_COOKIE_NAME } from '../lib/setFingerprintCookieAndSignJwt';
import handleGetRepository from '../utils/handleGetRepository';

// Go up one directory, then look for file name
const pathToKey = path.join(__dirname, '..', '..', 'id_rsa_pub.pem');

// The verifying public key
const PUB_KEY = fs.readFileSync(pathToKey, 'utf8');

// TODO: replace to use HS256 algoritm
// At a minimum, you must pass the `jwtFromRequest` and `secretOrKey` properties
const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: PUB_KEY,
  algorithms: ['RS256'],
  passReqToCallback: true
};

const userRepository = handleGetRepository(User);

// app.js will pass the global passport object here, and this function will configure it
module.exports = (passport) => {
  // The JWT payload is passed into the verify callback
  passport.use(
    new JwtStrategy(options, function (req: Request, jwt_payload: Payload, done) {
      const { fingerprintHash } = req.body;

      const fingerprintCookie = req.cookies[FINGERPRINT_COOKIE_NAME];
      if (!fingerprintCookie) return done(null, false);

      // Compute a SHA256 hash of the received fingerprint in cookie in order to compare
      // it to the fingerprint hash stored in the token
      const fingerprintCookieHash = sha256(fingerprintCookie);

      console.log(fingerprintHash, fingerprintCookieHash);

      if (fingerprintHash != fingerprintCookieHash) {
        return done(null, false);
      }

      delete req.body.fingerprintHash;

      // We will assign the `sub` property on the JWT to the database ID of user
      userRepository
        .findOneBy({ id: jwt_payload['X-User-Id'] })
        .then((user) => {
          if (user) {
            // Since we are here, the JWT is valid and our user is valid, so we are authorized!
            req.user = user;
            return done(null, user);
          } else {
            return done(null, false);
          }
        })
        .catch((err) => {
          return done(err, false);
        });
    })
  );
};
