import { EntityTarget, Repository } from 'typeorm';
import dataSource, { redisConfig, testRedisConfig } from '../data-source';
import envConfig from '../config/envConfig';
import { Redis } from 'ioredis';

const handleGetRepository = <T>(entity: EntityTarget<T>): Repository<T> => {
  const environment = envConfig.NODE_ENV || 'development';
  return environment === 'test'
    ? dataSource.TestDataSource.manager.getRepository(entity)
    : dataSource.AppDataSource.manager.getRepository(entity);
};

export default handleGetRepository;
export const redisClient =
  (envConfig.NODE_ENV || 'development') === 'test'
    ? new Redis(testRedisConfig)
    : new Redis(redisConfig);
