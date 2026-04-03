import { TestFactory } from '../factory';
import { uuidv4 } from '../../lib/auth';
import { passwordResetRepository } from '../../repository';

describe('POST /auth/forgot/reset', () => {
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

    it('throws no errors for passwords if passwords are matched', async () => {
      let res = await factory.app
        .post('/auth/forgot/reset')
        .set('content-type', 'application/json')
        .send({
          email: 'test@example.com',
          password: 'Q1@w2e3r4',
          confirmPassword: 'Q1@w2e3r4'
        });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Not verified');
    });

    it('throws error if password and confirm password provided are mismatched', async () => {
      const res = await factory.app
        .post('/auth/forgot/reset')
        .set('content-type', 'application/json')
        .send({
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

    it('throws error if id is not provided', async () => {
      const res = await factory.app
        .post('/auth/forgot/reset')
        .set('content-type', 'application/json')
        .send({
          password: 'Q1@w2e3r4',
          confirmPassword: 'Q1@w2e3r4'
        });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Not verified');
    });
  });

  it('returns unverified error if id provided is incorrect', async () => {
    let res = await factory.app
      .post('/auth/forgot/reset')
      .set('content-type', 'application/json')
      .send({
        id: uuidv4(),
        password: 'Q1@w2e3r4',
        confirmPassword: 'Q1@w2e3r4'
      });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Not verified');
  });

  it('returns unverified error if id provided is correct', async () => {
    let res = await factory.app.post('/auth/forgot').set('content-type', 'application/json').send({
      email: 'test@example.com'
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Verification code sent successfully');
    const pwResetRecords = await passwordResetRepository.find();
    const pwResetId = pwResetRecords[pwResetRecords.length - 1].id;

    res = await factory.app
      .post('/auth/forgot/reset')
      .set('content-type', 'application/json')
      .send({
        id: pwResetId,
        password: 'Q1@w2e3r4',
        confirmPassword: 'Q1@w2e3r4'
      });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Not verified');
  });
});
