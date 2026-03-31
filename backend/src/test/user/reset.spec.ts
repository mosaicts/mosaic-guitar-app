import { TestFactory } from '../factory';

describe('Reset password', () => {
  const factory: TestFactory = new TestFactory();

  beforeAll(() => {
    return factory.init();
  });

  afterAll(() => {
    return factory.close();
  });

  describe('Reset password for a registered user', () => {
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

    it('should return no errors for passwords', async () => {
      let res = await factory.app.post('/auth/reset').set('content-type', 'application/json').send({
        email: 'test@example.com',
        password: 'Q1@w2e3r4',
        confirmPassword: 'Q1@w2e3r4'
      });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Error resetting password');
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

  describe('Reset password for unregistered user', () => {
    it('should return error', async () => {
      let res = await factory.app.post('/auth/reset').set('content-type', 'application/json').send({
        email: 'test1@example.com',
        password: 'Q1@w2e3r4',
        confirmPassword: 'Q1@w2e3r4'
      });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Error resetting password');
    });
  });
});
