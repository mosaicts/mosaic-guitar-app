import { TestFactory } from '../factory';
import { userRepository } from '../../repository';

describe('POST /auth/signup', () => {
  const factory: TestFactory = new TestFactory();
  const userInfoPartial = {
    firstName: 'test',
    lastName: 'example',
    username: 'testexample1',
    email: 'test1@example.com'
  };

  beforeAll(() => {
    return factory.init();
  });

  afterAll(() => {
    return factory.close();
  });

  describe('Signup an user with wrong passwords', () => {
    it('throws error when no password is provided', async () => {
      const res = await factory.app
        .post('/auth/signup')
        .set('content-type', 'application/json')
        .send({
          ...userInfoPartial,
          password: '',
          confirmPassword: ''
        });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Validation failed');
      expect(res.body).toHaveProperty('errors');
      expect(res.body.errors).toHaveProperty('password');
      expect(res.body.errors.password[0]).toBe('Password must not be empty');
      expect(res.body.errors).toHaveProperty('confirmPassword');
      expect(res.body.errors.confirmPassword[0]).toBe('Confirm Password must not be empty');
      const users = await userRepository.find();
      expect(users).toHaveLength(0);
    });

    it('throws error when no confirm password is provided', async () => {
      const res = await factory.app
        .post('/auth/signup')
        .set('content-type', 'application/json')
        .send({
          ...userInfoPartial,
          password: 'Abc123456',
          confirmPassword: ''
        });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Validation failed');
      expect(res.body).toHaveProperty('errors');
      expect(res.body.errors).toHaveProperty('confirmPassword');
      expect(res.body.errors.confirmPassword[0]).toBe('Confirm Password must not be empty');
      expect(res.body.errors.confirmPassword[1]).toBe('Password and Confirm Password do not match');
      const users = await userRepository.find();
      expect(users).toHaveLength(0);
    });

    it('throws error when password and confirm password provided are mismatched', async () => {
      const res = await factory.app
        .post('/auth/signup')
        .set('content-type', 'application/json')
        .send({
          ...userInfoPartial,
          password: 'Abc123456',
          confirmPassword: 'Abc'
        });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Validation failed');
      expect(res.body).toHaveProperty('errors');
      expect(res.body.errors).toHaveProperty('confirmPassword');
      expect(res.body.errors.confirmPassword[0]).toBe('Password and Confirm Password do not match');
      const users = await userRepository.find();
      expect(users).toHaveLength(0);
    });
  });

  describe('Signup an user with wrong emails', () => {
    const userInfoPartial = {
      firstName: 'test',
      lastName: 'example',
      username: 'testexample1',
      password: 'Abc@12345678',
      confirmPassword: 'Abc@12345678'
    };

    it('throws error when email is not provided', async () => {
      const res = await factory.app
        .post('/auth/signup')
        .set('content-type', 'application/json')
        .send({
          ...userInfoPartial,
          email: ''
        });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Validation failed');
      expect(res.body).toHaveProperty('errors');
      expect(res.body.errors).toHaveProperty('email');
      expect(res.body.errors.email[0]).toBe('Email is required');
      const users = await userRepository.find();
      expect(users).toHaveLength(0);
    });

    it('throws error when email provided is invalid', async () => {
      const res = await factory.app
        .post('/auth/signup')
        .set('content-type', 'application/json')
        .send({
          ...userInfoPartial,
          email: 'test@example'
        });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Validation failed');
      expect(res.body).toHaveProperty('errors');
      expect(res.body.errors).toHaveProperty('email');
      expect(res.body.errors.email[0]).toBe('Please provide a valid email address');
      const users = await userRepository.find();
      expect(users).toHaveLength(0);
    });
  });

  describe('Signup an user with wrong usernames', () => {
    const userInfoPartial = {
      firstName: 'test',
      lastName: 'example',
      email: 'test1@example.com',
      password: 'Abc@12345678',
      confirmPassword: 'Abc@12345678'
    };

    it('throws error when no username is provided', async () => {
      const res = await factory.app
        .post('/auth/signup')
        .set('content-type', 'application/json')
        .send({
          ...userInfoPartial,
          username: ''
        });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Validation failed');
      expect(res.body).toHaveProperty('errors');
      expect(res.body.errors).toHaveProperty('username');
      expect(res.body.errors.username).toEqual(['Username is required']);
      const users = await userRepository.find();
      expect(users).toHaveLength(0);
    });
  });

  describe('Signup with duplicate email or username', () => {
    beforeAll(() => {
      return factory.app.post('/auth/signup').set('content-type', 'application/json').send({
        firstName: 'test',
        lastName: 'example',
        username: 'testexample',
        email: 'test@example.com',
        password: 'Abc@123456',
        confirmPassword: 'Abc@123456'
      });
    });

    it('throws error when email provided exists', async () => {
      const res = await factory.app
        .post('/auth/signup')
        .set('content-type', 'application/json')
        .send({
          ...userInfoPartial,
          email: 'test@example.com'
        });
      expect(res.statusCode).toBe(400);
      expect(res.body.errors.email[0]).toBe('Email already in use');
      const users = await userRepository.find();
      expect(users).toHaveLength(1);
    });

    it('throws error when username provided exists', async () => {
      const res = await factory.app
        .post('/auth/signup')
        .set('content-type', 'application/json')
        .send({
          ...userInfoPartial,
          username: 'testexample'
        });
      expect(res.statusCode).toBe(400);
      expect(res.body.errors.username[0]).toBe('Username already in use');
      const users = await userRepository.find();
      expect(users).toHaveLength(1);
    });
  });

  describe('Signup an user successfully', () => {
    it('reurns 200 if user data is valid', async () => {
      const res = await factory.app
        .post('/auth/signup')
        .set('content-type', 'application/json')
        .send({
          firstName: 'test',
          lastName: 'example',
          username: 'testexample1',
          email: 'test1@example.com',
          password: 'Abc@12345678',
          confirmPassword: 'Abc@12345678'
        });
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Registration successful, please verify your email');

      const users = await userRepository.find();
      expect(users).toHaveLength(2);
    });

    it('returns 200 when a long password is provided', async () => {
      const res = await factory.app
        .post('/auth/signup')
        .set('content-type', 'application/json')
        .send({
          firstName: 'test',
          lastName: 'example',
          username: 'testexample2',
          email: 'test2@example.com',
          password: '184782u42ujmjfkjf9u2918ujfjjjsjkj29@fajjAgjkbjkjkjksjiu29@2i4uiGgjkjw022849j',
          confirmPassword:
            '184782u42ujmjfkjf9u2918ujfjjjsjkj29@fajjAgjkbjkjkjksjiu29@2i4uiGgjkjw022849j'
        });
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Registration successful, please verify your email');

      const users = await userRepository.find();
      expect(users).toHaveLength(3);
    });
  });
});
