import { TestFactory } from '../factory';
import { passwordResetRepository } from '../../repository';

describe('POST /auth/forgot', () => {
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

  it('throws error when email is not provided ', async () => {
    const res = await factory.app
      .post('/auth/forgot')
      .set('content-type', 'application/json')
      .send({
        email: ''
      });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Validation failed');
    const pwResetRecords = await passwordResetRepository.find();
    expect(pwResetRecords).toHaveLength(0);
  });

  it('throws no error when email provided does not exist for output consistency', async () => {
    const res = await factory.app
      .post('/auth/forgot')
      .set('content-type', 'application/json')
      .send({
        email: 'test1@example.com'
      });
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Verification code sent successfully');
    const pwResetRecords = await passwordResetRepository.find();
    expect(pwResetRecords).toHaveLength(0);
  });

  it('throws error when email input is invalid', async () => {
    const res = await factory.app
      .post('/auth/forgot')
      .set('content-type', 'application/json')
      .send({
        email: 'test123'
      });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Validation failed');
    const pwResetRecords = await passwordResetRepository.find();
    expect(pwResetRecords).toHaveLength(0);
  });

  it('returns 200 when email input is valid and exists', async () => {
    const res = await factory.app
      .post('/auth/forgot')
      .set('content-type', 'application/json')
      .send({
        email: 'test@example.com'
      });
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Verification code sent successfully');
    const pwResetRecords = await passwordResetRepository.find();
    expect(pwResetRecords).toHaveLength(1);
  });
});
