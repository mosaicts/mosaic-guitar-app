import { TestFactory } from '../factory';

describe('Reset password', () => {
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

  it.skip('should be able to login with new password', async () => {
    let res = await factory.app.post('/auth/reset').set('content-type', 'application/json').send({
      email: 'test@example.com',
      password: 'Q1@w2e3r4',
      confirmPassword: 'Q1@w2e3r4'
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('success');

    res = await factory.app.post('/auth/login').set('content-type', 'application/json').send({
      email: 'test@example.com',
      password: 'Q1@w2e3r4'
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe(
      'This email has not been verified. Please check your email for a verification link.'
    );
  });

  it('should return error about mismatched password and confirm password ', async () => {
    let res = await factory.app.post('/auth/reset').set('content-type', 'application/json').send({
      email: 'test@example.com',
      password: 'Q1@w2e3r4',
      confirmPassword: 'wrongconfirmpassword'
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Validation failed');
    expect(res.body).toHaveProperty('errors');
    expect(res.body.errors).toHaveProperty('confirmPassword');
    expect(res.body.errors.confirmPassword[0]).toBe('Password and Confirm Password do not match');
  });
});
