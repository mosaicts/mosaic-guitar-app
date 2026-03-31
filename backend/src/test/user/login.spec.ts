import { TestFactory } from '../factory';

describe('Login user', () => {
  const factory: TestFactory = new TestFactory();

  beforeAll(() => {
    return factory.init();
  });

  afterAll(() => {
    return factory.close();
  });

  describe('Login registered user', () => {
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

    describe('Login an user with wrong passwords', () => {
      const userInfoPartial = {
        email: 'test@example.com'
      };

      it('should return error of unverified email ', async () => {
        const res = await factory.app
          .post('/auth/login')
          .set('content-type', 'application/json')
          .send({
            ...userInfoPartial,
            password: 'Abc@123478'
          });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe(
          'This email has not been verified. Please check your email for a verification link.'
        );
      });
    });

    describe('Login an user with wrong emails', () => {
      const userInfoPartial = {
        password: 'Abc@123456'
      };

      it('should return error of incorrect email or password', async () => {
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

    describe('Login an user with both wrong email and password', () => {
      it('should return error of incorrect email or password', async () => {
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

    describe('Login successfully', () => {
      it('should login successfully ', async () => {
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
  });

  describe('Login unregistered user', () => {
    it('should return error of incorrect email or password ', async () => {
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
