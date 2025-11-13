import fs from 'fs';
import path from 'path';
import 'dotenv/config';

const pathToPrivKey = path.join(__dirname, '..', '..', 'id_rsa_priv.pem');
const pathToPubKey = path.join(__dirname, '..', '..', 'id_rsa_pub.pem');

type EnvConfig = {
  PORT: number;
  NODE_ENV: string;
  BACKEND_URL: string;
  CLIENT_URL: string;

  POSTGRES_HOST: string;
  POSTGRES_PORT: number;
  POSTGRES_USER: string;
  POSTGRES_PASSWORD: string;
  POSTGRES_DB: string;

  REDIS_HOST: string;
  REDIS_PORT: number;
  REDIS_PASSWORD: string;

  PRIV_KEY: string;
  PUB_KEY: string;

  GMAIL_HOST: string;
  GMAIL_SERVICE: string;
  GMAIL_USER: string;
  GMAIL_PASS: string;
};

type ENV = Partial<EnvConfig> & {
  [K in keyof EnvConfig]: EnvConfig[K] | undefined;
};

const getConfig = (): ENV => ({
  PORT: Number(process.env.PORT),
  NODE_ENV: process.env.NODE_ENV,
  BACKEND_URL: process.env.PUBLIC_MOSAIC_BACKEND_URL,
  CLIENT_URL: process.env.PUBLIC_MOSAIC_CLIENT_URL,

  POSTGRES_HOST: process.env.POSTGRES_HOST,
  POSTGRES_PORT: Number(process.env.POSTGRES_PORT),
  POSTGRES_USER: process.env.POSTGRES_USER,
  POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD,
  POSTGRES_DB: process.env.POSTGRES_DB,

  REDIS_HOST: process.env.REDIS_HOST,
  REDIS_PORT: Number(process.env.REDIS_PORT),
  REDIS_PASSWORD: process.env.REDIS_PASSWORD,

  PRIV_KEY: fs.readFileSync(pathToPrivKey, 'utf8'),
  PUB_KEY: fs.readFileSync(pathToPubKey, 'utf8'),

  GMAIL_HOST: process.env.GMAIL_HOST,
  GMAIL_SERVICE: process.env.GMAIL_SERVICE,
  GMAIL_USER: process.env.GMAIL_USER,
  GMAIL_PASS: process.env.GMAIL_PASS
});

const getSanitizedConfig = (config: ENV): EnvConfig => {
  for (const [key, value] of Object.entries(config)) {
    if (value === undefined) {
      throw new Error(`Missing key ${key} in .env`);
    }
  }
  return config as EnvConfig;
};

const config = getConfig();

const sanitizedConfig = getSanitizedConfig(config);

export default sanitizedConfig;
