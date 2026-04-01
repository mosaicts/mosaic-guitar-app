import { TestFactory } from '../factory';

describe('POST /auth/reset/verify', () => {
  const factory: TestFactory = new TestFactory();

  beforeAll(() => {
    return factory.init();
  });

  afterAll(() => {
    return factory.close();
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

    it('throws error if email is not provided ', async () => {
      const res = await factory.app
        .post('/auth/reset/verify')
        .set('content-type', 'application/json')
        .send({
          email: ''
        });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Validation failed');
    });

    it('throws error if pin is not provided', async () => {
      const res = await factory.app
        .post('/auth/reset/verify')
        .set('content-type', 'application/json')
        .send({
          email: 'test1@example.com'
        });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Error verifying');
    });

    it('throws error if pin is empty', async () => {
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

    it('throws error if email is invalid', async () => {
      const res = await factory.app
        .post('/auth/reset/verify')
        .set('content-type', 'application/json')
        .send({
          email: 'test123'
        });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Validation failed');
    });

    it('throws error with the number of remaining tries accordingly when a wrong otp is provided', async () => {
      let res = await factory.app
        .post('/auth/reset/verify')
        .set('content-type', 'application/json')
        .send({
          email: 'test@example.com',
          otp: '123456'
        });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Wrong OTP. You have 4 more tries.');

      res = await factory.app
        .post('/auth/reset/verify')
        .set('content-type', 'application/json')
        .send({
          email: 'test@example.com',
          otp: '789012'
        });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Wrong OTP. You have 3 more tries.');
    });
  });
});
