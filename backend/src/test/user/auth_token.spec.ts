import { TestFactory } from '../factory';

describe('POST /auth/token', () => {
  const factory: TestFactory = new TestFactory();

  beforeAll(() => {
    return factory.init();
  });

  afterAll(() => {
    return factory.close();
  });

  // beforeAll(() => {
  //   return factory.app.post('/auth/signup').set('content-type', 'application/json').send({
  //     firstName: 'test',
  //     lastName: 'example',
  //     username: 'testexample',
  //     email: 'test@example.com',
  //     password: 'Abc@123456',
  //     confirmPassword: 'Abc@123456'
  //   });
  // });

  it('throws error when sending with no cookies ', async () => {
    const res = await factory.app.post('/auth/token').set('content-type', 'application/json').send({
      fingerprintHash: ''
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Unable to refresh JWT token');
  });

  it('throws error when sending with no fingerprint ', async () => {
    const res = await factory.app.post('/auth/token').set('content-type', 'application/json').send({
      fingerprintHash: ''
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Unable to refresh JWT token');
  });
});
