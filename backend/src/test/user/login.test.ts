import { TestFactory } from '../factory';

describe('Login user', () => {
  const factory: TestFactory = new TestFactory();

  beforeEach(() => {
    return factory.init();
  });

  afterEach(() => {
    return factory.close();
  });

  beforeEach(() => {
    return factory.app.post('/auth/register').set('content-type', 'application/json').send({
      firstName: 'dung',
      lastName: 'nguyen',
      username: 'leonard',
      email: 'dungnguyen2712002@gmail.com',
      password: 'Abc@123456'
    });
  });

  describe('Login an user with wrong passwords', () => {
    const userInfoPartial = {
      email: 'dungnguyen2712002@gmail.com'
    };

    it('should return wrong password error ', async () => {
      const res = await factory.app
        .post('/auth/login')
        .set('content-type', 'application/json')
        .send({
          ...userInfoPartial,
          password: 'Abc@123478'
        });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Email or password is not correct');
    });
  });

  describe('Login an user with wrong emails', () => {
    const userInfoPartial = {
      password: 'Abc@123456'
    };

    it('should return user not found ', async () => {
      const res = await factory.app
        .post('/auth/login')
        .set('content-type', 'application/json')
        .send({
          ...userInfoPartial,
          email: 'dungnguyen271200@gmail.com'
        });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Email or password is not correct');
    });
  });

  describe('Login an user with both wrong email and password', () => {
    it('should return user not found ', async () => {
      const res = await factory.app
        .post('/auth/login')
        .set('content-type', 'application/json')
        .send({
          email: 'dungnguyen271200@gmail.com',
          password: 'Abc@144444'
        });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Email or password is not correct');
    });
  });

  describe('Login successfully', () => {
    it('should login successfully ', async () => {
      const res = await factory.app
        .post('/auth/login')
        .set('content-type', 'application/json')
        .send({
          email: 'dungnguyen2712002@gmail.com',
          password: 'Abc@123456'
        });
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('User login successfully');
      expect(res.body).toHaveProperty('jwt');
      expect(res.body).toHaveProperty('refreshToken');
    });
  });
});
