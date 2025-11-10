import { TestFactory } from '../factory';

describe('Register user', () => {
  const factory: TestFactory = new TestFactory();

  beforeEach(() => {
    return factory.init();
  });

  afterEach(() => {
    return factory.close();
  });

  beforeEach(() => {
    return factory.app.post('/auth/register').set('content-type', 'application/json').send({
      firstName: 'dung',
      lastName: 'nguyen',
      username: 'leonard',
      email: 'dungnguyen2712002@gmail.com',
      password: 'Abc@123456'
    });
  });

  describe('Register an user with wrong passwords', () => {
    const userInfoPartial = {
      firstName: 'dung',
      lastName: 'nguyen',
      username: 'dung271',
      email: 'dungnguyen2712000@gmail.com'
    };

    it('should return error about empty password ', async () => {
      const res = await factory.app
        .post('/auth/register')
        .set('content-type', 'application/json')
        .send({
          ...userInfoPartial,
          password: ''
        });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Validation failed');
      expect(res.body).toHaveProperty('errors');
      expect(res.body.errors).toHaveProperty('password');
      expect(res.body.errors.password[0]).toBe('Password must not be empty');
    });
  });

  describe('Register an user with wrong emails', () => {
    const userInfoPartial = {
      firstName: 'dung',
      lastName: 'nguyen',
      username: 'dungnq',
      password: 'Abc@12345678'
    };

    it('should return error missing email ', async () => {
      const res = await factory.app
        .post('/auth/register')
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
    });

    it('should return error of invalid email ', async () => {
      const res = await factory.app
        .post('/auth/register')
        .set('content-type', 'application/json')
        .send({
          ...userInfoPartial,
          email: 'dungnguyen2712001'
        });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Validation failed');
      expect(res.body).toHaveProperty('errors');
      expect(res.body.errors).toHaveProperty('email');
      expect(res.body.errors.email[0]).toBe('Please provide a valid email address');
    });

    it('should return error of invalid email ', async () => {
      const res = await factory.app
        .post('/auth/register')
        .set('content-type', 'application/json')
        .send({
          ...userInfoPartial,
          email: 'abcdef@http.gmail.com'
        });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Validation failed');
      expect(res.body).toHaveProperty('errors');
      expect(res.body.errors).toHaveProperty('email');
      expect(res.body.errors.email[0]).toBe('Please provide a valid email address');
    });

    it('should return error of duplicate email ', async () => {
      const res = await factory.app
        .post('/auth/register')
        .set('content-type', 'application/json')
        .send({
          ...userInfoPartial,
          email: 'dungnguyen2712002@gmail.com'
        });
      expect(res.statusCode).toBe(400);
      expect(res.body.errors.email[0]).toBe('Email already in use');
    });
  });

  describe('Register an user with wrong usernames', () => {
    const userInfoPartial = {
      firstName: 'dung',
      lastName: 'nguyen',
      email: 'dungnguyen2712000@gmail.com',
      password: 'Abc@12345678'
    };

    it('should return error about empty username', async () => {
      const res = await factory.app
        .post('/auth/register')
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
    });

    it('should return error about duplicate username', async () => {
      const res = await factory.app
        .post('/auth/register')
        .set('content-type', 'application/json')
        .send({
          ...userInfoPartial,
          username: 'leonard'
        });
      expect(res.statusCode).toBe(400);
      expect(res.body.errors.username[0]).toBe('Username already in use');
    });
  });

  describe('Register an user successfully', () => {
    it('should return no error', async () => {
      const res = await factory.app
        .post('/auth/register')
        .set('content-type', 'application/json')
        .send({
          firstName: 'dung',
          lastName: 'nguyen',
          username: 'dung271',
          email: 'dungnguyen2712000@gmail.com',
          password: 'Abc@12345678'
        });
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('User registered successfully');
    });
  });

  it('should return no error given long password', async () => {
    const res = await factory.app
      .post('/auth/register')
      .set('content-type', 'application/json')
      .send({
        firstName: 'dung',
        lastName: 'nguyen',
        username: 'dung271',
        email: 'dungnguyen2712000@gmail.com',
        password: '184782u42ujmjfkjf9u2918ujfjjjsjkj29@fajjAgjkbjkjkjksjiu29@2i4uiGgjkjw022849j'
      });
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('User registered successfully');
  });
});
