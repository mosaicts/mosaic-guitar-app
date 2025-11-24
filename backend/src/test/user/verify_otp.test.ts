import { TestFactory } from '../factory';

describe('Verify OTP', () => {
  const factory: TestFactory = new TestFactory();

  beforeEach(() => {
    return factory.init();
  });

  afterEach(() => {
    return factory.close();
  });

  it('should return error about wrong otp with the number of remaining tries accordingly', async () => {
    let res = await factory.app
      .post('/auth/verify/otp')
      .set('content-type', 'application/json')
      .send({
        email: 'test@example.com',
        pin: '123456'
      });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Wrong OTP. You have 4 more tries.');

    res = await factory.app.post('/auth/verify/otp').set('content-type', 'application/json').send({
      email: 'test@example.com',
      pin: '789012'
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Wrong OTP. You have 3 more tries.');
  });
});
