const request = require('supertest');
const app = require('../server'); // make sure this exports your Express app
const mongoose = require('mongoose');

describe('GET /blogs', () => {
  beforeAll(async () => {
    // Optionally connect to a test DB
    await mongoose.connect(process.env.TEST_DB_URI);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should return a list of blogs for authenticated users', async () => {
    const token = 'your-test-token'; // replace or mock
    const res = await request(app)
      .get('/blogs')
      .set('Cookie', [`token=${token}`])
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true); // assuming you return JSON
    // add more assertions here
  });

  it('should block unauthenticated users', async () => {
    const res = await request(app)
      .get('/blogs')
      .expect(401); // or 302 if you redirect to login
  });
});
