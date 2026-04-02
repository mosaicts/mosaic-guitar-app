import { TestFactory } from '../factory';
import { FINGERPRINT_COOKIE_NAME, REFRESH_TOKEN_COOKIE_NAME } from '../../lib/cookie';

describe('POST /auth/token', () => {
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

  it('throws error when no cookie is provided', async () => {
    const res = await factory.app.post('/auth/token').set('content-type', 'application/json');
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Unable to refresh JWT token');
  });

  it('throws error when no fingerprint cookie is provided', async () => {
    const res = await factory.app
      .post('/auth/token')
      .set('content-type', 'application/json')
      .set('Cookie', `${REFRESH_TOKEN_COOKIE_NAME}=12345667`);

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Unable to refresh JWT token');
  });

  it('throws error when no refresh token cookie is provided', async () => {
    const res = await factory.app
      .post('/auth/token')
      .set('content-type', 'application/json')
      .set('Cookie', `${FINGERPRINT_COOKIE_NAME}=12345667`);
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Unable to refresh JWT token');
  });

  it('throws error when incorrect refresh token and fingerprint cookies are provided', async () => {
    const res = await factory.app
      .post('/auth/token')
      .set('content-type', 'application/json')
      .set('Cookie', `${REFRESH_TOKEN_COOKIE_NAME}=12345667;${FINGERPRINT_COOKIE_NAME}=abcdefgh`);
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Unable to refresh JWT token');
  });
});
