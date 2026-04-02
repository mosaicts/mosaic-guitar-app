import { TestFactory } from '../factory';
import { passwordResetRepository } from '../../repository';

describe('POST /auth/reset/verify', () => {
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

  describe('POST /auth/forgot was not made before', () => {
    it('throws error', async () => {
      let res = await factory.app
        .post('/auth/reset/verify')
        .set('content-type', 'application/json')
        .send({
          email: 'test@example.com',
          otp: '123456'
        });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Error verifying');
    });
  });

  describe('POST /auth/forgot was made before', () => {
    beforeAll(() => {
      return factory.app.post('/auth/forgot').set('content-type', 'application/json').send({
        email: 'test@example.com'
      });
    });

    it('throws error if email provided is empty', async () => {
      const res = await factory.app
        .post('/auth/reset/verify')
        .set('content-type', 'application/json')
        .send({
          email: ''
        });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Validation failed');
    });

    it('throws error if no email is provided', async () => {
      const res = await factory.app
        .post('/auth/reset/verify')
        .set('content-type', 'application/json')
        .send({});
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Validation failed');
    });

    it('throws error if no pin provided', async () => {
      const res = await factory.app
        .post('/auth/reset/verify')
        .set('content-type', 'application/json')
        .send({
          email: 'test1@example.com'
        });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Error verifying');
    });

    it('throws error if pin provided is empty', async () => {
      const res = await factory.app
        .post('/auth/reset/verify')
        .set('content-type', 'application/json')
        .send({
          email: 'test1@example.com',
          pin: ''
        });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Error verifying');
    });

    it('throws error if email provided is invalid', async () => {
      const res = await factory.app
        .post('/auth/reset/verify')
        .set('content-type', 'application/json')
        .send({
          email: 'test123'
        });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Validation failed');
    });

    it('throws error with the number of remaining tries accordingly when a wrong otp is provided and blocks if too many requests is sent', async () => {
      let otp: string;

      for (let i = 1; i <= 6; ++i) {
        otp = 'xxxxxx'.replace(/[x]/g, () => Math.floor(Math.random() * 9) + ''); // random integer between 0 and 9
        // console.log({ otp });/
        let res = await factory.app
          .post('/auth/reset/verify')
          .set('content-type', 'application/json')
          .send({
            email: 'test@example.com',
            otp
          });

        if (i === 6) {
          expect(res.statusCode).toBe(429);
          // expect(res.body).toBe('Too Many Requests');
        } else {
          expect(res.statusCode).toBe(400);
          expect(res.body.message).toBe(`Wrong OTP. You have ${5 - i} more tries.`);
        }
      }
    });
  });
});
