import { TestFactory } from '../factory';

describe('Reset verify', () => {
  const factory: TestFactory = new TestFactory();

  beforeAll(() => {
    return factory.init();
  });

  afterAll(() => {
    return factory.close();
  });

  it('should return error of empty email ', async () => {
    const res = await factory.app
      .post('/auth/reset/verify')
      .set('content-type', 'application/json')
      .send({
        email: ''
      });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Validation failed');
  });

  it('should return error of empty pin', async () => {
    const res = await factory.app
      .post('/auth/reset/verify')
      .set('content-type', 'application/json')
      .send({
        email: 'test1@example.com'
      });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Verification code sent successfully');
  });

  it('should return error of invalid when email input is not valid', async () => {
    const res = await factory.app
      .post('/auth/reset/verify')
      .set('content-type', 'application/json')
      .send({
        email: 'test123'
      });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Validation failed');
  });
});
