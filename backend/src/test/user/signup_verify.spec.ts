import { TestFactory } from '../factory';
import { userRepository } from '../../repository';

describe('GET /signup/verify/:id/:token', () => {
  const factory: TestFactory = new TestFactory();
  let userId;

  beforeAll(() => {
    return factory.init();
  });

  afterAll(() => {
    return factory.close();
  });

  beforeAll(async () => {
    await factory.app.post('/auth/signup').set('content-type', 'application/json').send({
      firstName: 'test',
      lastName: 'example',
      username: 'testexample',
      email: 'test@example.com',
      password: 'Abc@123456',
      confirmPassword: 'Abc@123456'
    });
    const users = await userRepository.find();
    userId = users[0].id;
  });

  it('throws error if token is not provided in url params', async () => {
    const res = await factory.app
      .get('/auth/signup/verify/testid')
      .set('content-type', 'application/json');
    expect(res.statusCode).toBe(404);
  });

  it('throws error if id and token provided from url params is invalid', async () => {
    const res = await factory.app
      .get('/auth/signup/verify/testid/testoken')
      .set('content-type', 'application/json');
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Error verifying');
  });

  it('redirects to a different url if id is correct but token is wrong', async () => {
    const res = await factory.app
      .get(`/auth/signup/verify/${userId}/testoken`)
      .set('content-type', 'application/json');
    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toContain('/verify?status=failed&email=test%40example.com');
  });
});
