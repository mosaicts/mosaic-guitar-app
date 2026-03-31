import { TestFactory } from '../factory';

describe('Forgot password', () => {
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

  it('should return error of empty email ', async () => {
    const res = await factory.app
      .post('/auth/forgot')
      .set('content-type', 'application/json')
      .send({
        email: ''
      });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Validation failed');
  });

  it('should return no error when email does not exist', async () => {
    const res = await factory.app
      .post('/auth/forgot')
      .set('content-type', 'application/json')
      .send({
        email: 'test1@example.com'
      });
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Verification code sent successfully');
  });

  it('should return error of invalid email when email input is not valid', async () => {
    const res = await factory.app
      .post('/auth/forgot')
      .set('content-type', 'application/json')
      .send({
        email: 'test123'
      });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Validation failed');
  });
});
