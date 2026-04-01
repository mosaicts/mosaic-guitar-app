import { TestFactory } from '../factory';

describe('POST /auth/login', () => {
  const factory: TestFactory = new TestFactory();

  beforeAll(() => {
    return factory.init();
  });

  afterAll(() => {
    return factory.close();
  });

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

  describe('Wrong password is provided', () => {
    const userInfoPartial = {
      email: 'test@example.com'
    };

    it('throws error of incorrect email or password when provided password 12345', async () => {
      const res = await factory.app
        .post('/auth/login')
        .set('content-type', 'application/json')
        .send({
          ...userInfoPartial,
          password: '12345'
        });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Email or password is not correct');
    });

    it('throws error of incorrect email or password when provided nearly matched password Abc@123478', async () => {
      const res = await factory.app
        .post('/auth/login')
        .set('content-type', 'application/json')
        .send({
          ...userInfoPartial,
          password: 'Abc@123478'
        });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Email or password is not correct');
    });
  });

  describe('Wrong email is provided', () => {
    const userInfoPartial = {
      password: 'Abc@123456'
    };

    it('throws error of incorrect email or password', async () => {
      const res = await factory.app
        .post('/auth/login')
        .set('content-type', 'application/json')
        .send({
          ...userInfoPartial,
          email: 'test1@example.con'
        });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Email or password is not correct');
    });
  });

  describe('Both wrong email and password are provided', () => {
    it('throws error of incorrect email or password', async () => {
      const res = await factory.app
        .post('/auth/login')
        .set('content-type', 'application/json')
        .send({
          email: 'test1@example.con',
          password: 'Abc@144444'
        });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Email or password is not correct');
    });
  });

  describe('Correct data is provided', () => {
    it('throws no error about wrong email or password', async () => {
      const res = await factory.app
        .post('/auth/login')
        .set('content-type', 'application/json')
        .send({
          email: 'test@example.com',
          password: 'Abc@123456'
        });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe(
        'This email has not been verified. Please check your email for a verification link.'
      );
    });
  });

  describe('Unregistered user data is provided', () => {
    it('throws error of incorrect email or password ', async () => {
      const res = await factory.app
        .post('/auth/login')
        .set('content-type', 'application/json')
        .send({
          email: 'test123@example.com',
          password: 'Abc@123456'
        });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Email or password is not correct');
    });
  });
});
