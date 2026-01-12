import { TestFactory } from '../factory';

describe('Signup user', () => {
  const factory: TestFactory = new TestFactory();

  beforeEach(() => {
    return factory.init();
  });

  afterEach(() => {
    return factory.close();
  });

  beforeEach(() => {
    return factory.app.post('/auth/signup').set('content-type', 'application/json').send({
      firstName: 'test',
      lastName: 'example',
      username: 'testexample',
      email: 'test@example.com',
      password: 'Abc@123456',
      confirmPassword: 'Abc@123456'
    });
  });

  describe('Signup an user with wrong passwords', () => {
    const userInfoPartial = {
      firstName: 'test',
      lastName: 'example',
      username: 'testexample1',
      email: 'test1@example.com'
    };

    it('should return error about empty password ', async () => {
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
    });

    it('should return error about empty confirm password ', async () => {
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
    });

    it('should return error about mismatched password and confirm password ', async () => {
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

    it('should return error missing email ', async () => {
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
    });

    it('should return error of invalid email ', async () => {
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
    });

    // it('should return error of invalid email ', async () => {
    //   const res = await factory.app
    //     .post('/auth/signup')
    //     .set('content-type', 'application/json')
    //     .send({
    //       ...userInfoPartial,
    //       email: 'abcdef@http.gmail.com'
    //     });
    //   expect(res.statusCode).toBe(400);
    //   expect(res.body.message).toBe('Validation failed');
    //   expect(res.body).toHaveProperty('errors');
    //   expect(res.body.errors).toHaveProperty('email');
    //   expect(res.body.errors.email[0]).toBe('Please provide a valid email address');
    // });

    it('should return error of duplicate email ', async () => {
      const res = await factory.app
        .post('/auth/signup')
        .set('content-type', 'application/json')
        .send({
          ...userInfoPartial,
          email: 'test@example.com'
        });
      expect(res.statusCode).toBe(400);
      expect(res.body.errors.email[0]).toBe('Email already in use');
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

    it('should return error about empty username', async () => {
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
    });

    it('should return error about duplicate username', async () => {
      const res = await factory.app
        .post('/auth/signup')
        .set('content-type', 'application/json')
        .send({
          ...userInfoPartial,
          username: 'testexample'
        });
      expect(res.statusCode).toBe(400);
      expect(res.body.errors.username[0]).toBe('Username already in use');
    });
  });

  describe('Signup an user successfully', () => {
    it('should return no error', async () => {
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
    });
  });

  it('should return no error given long password', async () => {
    const res = await factory.app
      .post('/auth/signup')
      .set('content-type', 'application/json')
      .send({
        firstName: 'test',
        lastName: 'example',
        username: 'testexample1',
        email: 'test1@example.com',
        password: '184782u42ujmjfkjf9u2918ujfjjjsjkj29@fajjAgjkbjkjkjksjiu29@2i4uiGgjkjw022849j',
        confirmPassword:
          '184782u42ujmjfkjf9u2918ujfjjjsjkj29@fajjAgjkbjkjkjksjiu29@2i4uiGgjkjw022849j'
      });
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Registration successful, please verify your email');
  });
});
