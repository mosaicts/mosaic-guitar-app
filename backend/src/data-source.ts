import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';
import { RedisOptions } from 'ioredis';
import { Redis } from 'ioredis';
import envConfig from './config/envConfig';

// Make sure to set this to false in production
const syncDatabase = true;
const entities = syncDatabase ? ['src/entities/*.ts'] : ['dist/entities/**/*.js'];

// POSTGRES
const postgresDBConfig: DataSourceOptions = {
  type: 'postgres',
  host: envConfig.POSTGRES_HOST,
  port: envConfig.POSTGRES_PORT,
  username: envConfig.POSTGRES_USER,
  password: envConfig.POSTGRES_PASSWORD,
  database: envConfig.POSTGRES_DB,
  synchronize: true,
  logging: false,
  entities,
  migrations: syncDatabase ? ['src/migrations/*.ts'] : ['dist/migrations/**/*.js'],
  migrationsTableName: 'ecm-postgres',
  subscribers: []
};

export const testPostgresDBConfig: DataSourceOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 2345,
  username: 'root',
  database: 'test',
  password: 'easypass',
  synchronize: true,
  dropSchema: true,
  entities
};

export const AppDataSource = new DataSource(postgresDBConfig);
const TestDataSource = new DataSource(testPostgresDBConfig);

// REDIS
const redisConfig: RedisOptions = {
  port: envConfig.REDIS_PORT,
  host: envConfig.REDIS_HOST,
  password: envConfig.REDIS_PASSWORD
};

export const testRedisConfig: RedisOptions = {
  port: 6380,
  host: 'localhost'
};

export const redisClient = new Redis(redisConfig);
redisClient.on('connect', () => {
  console.log('Redis connected succesfully');
  console.log('===============================');
});
redisClient.on('error', (err) => {
  console.log('Redis conncetion error : ', err);
  console.log('===============================');
});

export default { AppDataSource, TestDataSource };
