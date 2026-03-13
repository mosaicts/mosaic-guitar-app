import { Request } from 'express';
import crypto from 'crypto';
import { User } from '../entities/User.postgres';
import { sha256 } from '../lib/jwt';
import passport from 'passport';
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
const refresh = require('passport-oauth2-refresh');
import fs = require('fs');
import path = require('path');
import * as OTPAuth from 'otpauth';

import { Payload } from '../dto/user.dto';
import { FINGERPRINT_COOKIE_NAME } from '../lib/cookie';
import handleGetRepository from '../utils/handleGetRepository';
import envConfig from '../config/envConfig';

// Go up one directory, then look for file name
const pathToKey = path.join(__dirname, '..', '..', 'id_rsa_pub.pem');

// The verifying public key
const PUB_KEY = fs.readFileSync(pathToKey, 'utf8');

const userRepository = handleGetRepository(User);

function generateState() {
  return crypto.randomBytes(16).toString('hex');
}

// app.js will pass the global passport object here, and this function will configure it
// const jwtStrategyConfig = (passport) => {
// The JWT payload is passed into the verify callback
passport.use(
  'jwt',
  new JwtStrategy(
    // TODO: replace to use HS256 algoritm
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: PUB_KEY,
      algorithms: ['RS256'],
      passReqToCallback: true
    },
    (req: Request, jwt_payload: Payload, done) => {
      const { fingerprintHash } = req.body;
      const fingerprintCookie = req.cookies[FINGERPRINT_COOKIE_NAME];
      console.log({ fingerprintCookie });

      if (!fingerprintCookie) return done(null, false);

      // Compute a SHA256 hash of the received fingerprint in cookie in order to compare
      // it to the fingerprint hash stored in the token
      const fingerprintCookieHash = sha256(fingerprintCookie);

      console.log({ fingerprintHash, fingerprintCookieHash });
      if (fingerprintHash != fingerprintCookieHash) {
        console.log('fingerprint not correct');
        return done(null, false);
      }

      delete req.body.fingerprintHash;

      userRepository
        .findOneBy({ id: jwt_payload.sub })
        .then((user) => {
          if (user) {
            // Since we are here, the JWT is valid and our user is valid, so we are authorized!
            // req.user = user;
            return done(null, user);
          } else {
            return done(null, false);
          }
        })
        .catch((err) => {
          console.log(err);
          return done(err, false);
        });
    }
  )
);
// };

/**
 * Sign in with Google.
 */
const googleLogin = new GoogleStrategy(
  {
    clientID: envConfig.GOOGLE_CLIENT_ID,
    clientSecret: envConfig.GOOGLE_CLIENT_SECRET,
    callbackURL: `${envConfig.BACKEND_URL}/auth/google/callback`,
    scope: ['profile', 'email'],
    accessType: 'offline',
    prompt: 'consent',
    state: generateState(),
    passReqToCallback: true
  },
  async (req, accessToken, refreshToken, params, profile, done) => {
    console.log({ profile });
    profile = profile._json;

    try {
      const oldUser = await userRepository.findOneBy({ email: profile.email });

      if (oldUser) {
        oldUser.avatar = profile.picture;
        await userRepository.save(oldUser);
        return done(null, oldUser);
      }
    } catch (err) {
      console.log(err);
    }

    try {
      let newUser = new User();
      newUser.provider = 'google';
      newUser.googleId = profile.id;
      newUser.avatar = profile.picture;
      newUser.username = `user${profile.sub}`;
      newUser.email = profile.email;
      newUser.firstName = profile.given_name;
      newUser.lastName = profile.family_name;
      newUser.secret = new OTPAuth.Secret().base32;

      await userRepository.save(newUser);
      done(null, newUser);
    } catch (err) {
      console.log(err);
    }
  }
);

passport.use(googleLogin);

/**
 * Sign in with Facebook.
 */
const facebookLogin = new FacebookStrategy(
  {
    clientID: envConfig.FACEBOOK_APP_ID,
    clientSecret: envConfig.FACEBOOK_SECRET,
    callbackURL: `${envConfig.BACKEND_URL}/auth/facebook/callback`,
    profileFields: [
      'id',
      'emails',
      'gender',
      'profileUrl',
      'displayName',
      'locale',
      'name',
      'timezone',
      'updated_time',
      'verified',
      'picture.type(large)'
    ]
  },
  async (accessToken, refreshToken, profile, done) => {
    console.log({ profile });
    try {
      const oldUser = await userRepository.findOneBy({ email: profile.emails[0].value });

      if (oldUser) {
        return done(null, oldUser);
      }
    } catch (err) {
      console.log(err);
    }

    try {
      let newUser = new User();
      newUser.provider = 'facebook';
      newUser.facebookId = profile.id;
      newUser.avatar = profile.photos[0].value;
      newUser.username = `user${profile.id}`;
      newUser.email = profile.emails[0];
      [newUser.firstName, newUser.lastName] = profile.displayName.split(' ');
      newUser.secret = new OTPAuth.Secret().base32;

      await userRepository.save(newUser);
      done(null, newUser);
    } catch (err) {
      console.log(err);
    }
  }
);

passport.use(facebookLogin);
