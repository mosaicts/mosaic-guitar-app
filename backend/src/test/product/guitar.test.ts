import { TestFactory } from '../factory';

describe('GET /guitar/list', () => {
  const factory: TestFactory = new TestFactory();

  beforeEach((done) => {
    factory.init().then(done);
  });

  afterEach((done) => {
    factory.close().then(done);
  });

  it('should return a list of guitars ', async () => {
    const res = await factory.app.get('/guitar/list');
    expect(res.statusCode).toBe(200);
    expect(res.body.products.length).toBe(6);
  });
});
