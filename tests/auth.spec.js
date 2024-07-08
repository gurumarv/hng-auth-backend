const request = require('supertest');
const app = require('../server'); // Adjust path as per your project structure
const { sequelize } = require('../config/db');
const User = require('../models/User');
const Organisation = require('../models/Organisation');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Mock user data
const mockUser = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  password: 'password123',
  phone: '1234567890'
};

let userToken;

// Helper function to generate a token
const generateToken = (user) => {
  const payload = { user: { id: user.userId } };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' });
};

// Clean up database before each test
beforeEach(async () => {
  await sequelize.sync({ force: true }); // Force sync to recreate tables
});

// Close database connection after all tests
afterAll(async () => {
  await sequelize.close();
}, 100000); // Increased timeout for async operations

// End-to-End Tests for the Register Endpoint
describe('POST /auth/register', () => {
  it('Should register user successfully with default organisation', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send(mockUser)
      .expect(201);

    expect(res.body.token).toBeDefined();
    const tokenPayload = jwt.verify(res.body.token, process.env.JWT_SECRET);
    expect(tokenPayload.user.id).toBeDefined();

    // Verify user details
    const user = await User.findOne({ where: { email: mockUser.email } });
    expect(user).toBeDefined();
    expect(user.firstName).toBe(mockUser.firstName);
    expect(user.lastName).toBe(mockUser.lastName);

    // Verify default organisation creation
    const org = await Organisation.findOne({ where: { creatorId: user.userId } });
    expect(org).toBeDefined();
    expect(org.name).toBe(`${mockUser.firstName}'s Organisation`);
  }, 100000); // Increased timeout for async operations

  it('Should fail if required fields are missing', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({
        firstName: 'John',
        email: 'john.doe@example.com',
        password: 'password123'
      })
      .expect(422);

    expect(res.body.errors).toContainEqual(expect.objectContaining({ field: 'lastName' }));
  }, 100000); // Increased timeout for async operations

  it('Should fail if there’s duplicate email', async () => {
    await request(app)
      .post('/auth/register')
      .send(mockUser)
      .expect(201);

    const res = await request(app)
      .post('/auth/register')
      .send(mockUser)
      .expect(400);

    expect(res.body.errors).toContainEqual(expect.objectContaining({ field: 'email' }));
  }, 100000); 
});

// Token Generation Tests
describe('Token Generation', () => {
  it('Should generate a token with correct expiration', async () => {
    const user = await User.create(mockUser);
    const token = generateToken(user);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    expect(decoded.user.id).toBe(user.userId);
    expect(decoded.exp - decoded.iat).toBe(5 * 60 * 60); // 5 hours in seconds
  }, 100000); // Increased timeout for async operations

  it('Should contain correct user details in token', async () => {
    const user = await User.create(mockUser);
    const token = generateToken(user);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    expect(decoded.user.id).toBe(user.userId);
  }, 100000); // Increased timeout for async operations
});

// Organisation Access Control Tests
describe('Organisation Access Control', () => {
  it('Should ensure users can’t see data from organisations they don’t have access to', async () => {
    const user1 = await User.create(mockUser);
    const user2 = await User.create({
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      password: await bcrypt.hash('password456', 10),
      phone: '0987654321'
    });

    const org1 = await Organisation.create({ name: 'Org1', creatorId: user1.userId });

    userToken = generateToken(user2);

    const res = await request(app)
      .get(`/api/organisations/${org1.orgId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(403);

    expect(res.body.status).toBe('error');
    expect(res.body.message).toBe('Access denied');
  }, 100000); // Increased timeout for async operations
});
