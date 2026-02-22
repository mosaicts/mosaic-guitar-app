import { EntityTarget, Repository } from 'typeorm';
import dataSource, { redisConfig, testRedisConfig } from '../data-source';
import envConfig from '../config/envConfig';
import { Redis } from 'ioredis';

const environment = envConfig.NODE_ENV || 'development';

const handleGetRepository = <T>(entity: EntityTarget<T>): Repository<T> => {
  return environment === 'test'
    ? dataSource.TestDataSource.manager.getRepository(entity)
    : dataSource.AppDataSource.manager.getRepository(entity);
};

export const handleGetRedisClient = (): Redis => {
  return environment === 'test' ? new Redis(testRedisConfig) : new Redis(redisConfig);
};

export default handleGetRepository;
