const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { app, server } = require('../server');
const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
  server.close();
});

afterEach(async () => {
  await User.deleteMany();
  await Project.deleteMany();
  await Task.deleteMany();
});

describe('Auth API', () => {
  it('1. should signup a new user', async () => {
    const res = await request(app)
      .post('/auth/signup')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'Member'
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('token');
  });

  it('2. should fail signup with existing email', async () => {
    await request(app).post('/auth/signup').send({
      name: 'Test', email: 'test@example.com', password: 'password123'
    });
    const res = await request(app)
      .post('/auth/signup')
      .send({
        name: 'Test 2', email: 'test@example.com', password: 'password123'
      });
    expect(res.statusCode).toEqual(400);
  });

  it('3. should login existing user', async () => {
    await request(app).post('/auth/signup').send({
      name: 'Test', email: 'test@example.com', password: 'password123'
    });
    const res = await request(app)
      .post('/auth/login')
      .send({
        email: 'test@example.com', password: 'password123'
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
  });

  it('4. should fail login with wrong password', async () => {
    await request(app).post('/auth/signup').send({
      name: 'Test', email: 'test@example.com', password: 'password123'
    });
    const res = await request(app)
      .post('/auth/login')
      .send({
        email: 'test@example.com', password: 'wrong'
      });
    expect(res.statusCode).toEqual(401);
  });

  it('5. should fail login with non-existent email', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({
        email: 'nobody@example.com', password: 'password123'
      });
    expect(res.statusCode).toEqual(401);
  });

  it('6. should logout user', async () => {
    const signup = await request(app).post('/auth/signup').send({
      name: 'Test', email: 'test@example.com', password: 'password123'
    });
    const res = await request(app)
      .post('/auth/logout')
      .set('Authorization', `Bearer ${signup.body.token}`);
    expect(res.statusCode).toEqual(200);
  });
});

describe('Protected Routes & Roles', () => {
  let adminToken;
  let memberToken;
  let adminId;

  beforeEach(async () => {
    const admin = await request(app).post('/auth/signup').send({
      name: 'Admin', email: 'admin@example.com', password: 'password123', role: 'Admin'
    });
    adminToken = admin.body.token;
    adminId = admin.body._id;

    const member = await request(app).post('/auth/signup').send({
      name: 'Member', email: 'member@example.com', password: 'password123', role: 'Member'
    });
    memberToken = member.body.token;
  });

  it('7. should not allow access without token', async () => {
    const res = await request(app).get('/projects');
    expect(res.statusCode).toEqual(401);
  });

  it('8. should allow Admin to create a project', async () => {
    const res = await request(app)
      .post('/projects')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Project 1' });
    expect(res.statusCode).toEqual(201);
  });

  it('9. should not allow Member to create a project', async () => {
    const res = await request(app)
      .post('/projects')
      .set('Authorization', `Bearer ${memberToken}`)
      .send({ name: 'Project 1' });
    expect(res.statusCode).toEqual(403);
  });
});

describe('Tasks CRUD', () => {
  let adminToken;
  let projectId;

  beforeEach(async () => {
    const admin = await request(app).post('/auth/signup').send({
      name: 'Admin', email: 'admin@example.com', password: 'password123', role: 'Admin'
    });
    adminToken = admin.body.token;

    const project = await request(app)
      .post('/projects')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Project 1' });
    projectId = project.body._id;
  });

  it('10. should create a task', async () => {
    const res = await request(app)
      .post('/tasks')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Task 1', projectId });
    expect(res.statusCode).toEqual(201);
  });

  it('11. should fail to create task without project', async () => {
    const res = await request(app)
      .post('/tasks')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Task 1' });
    expect(res.statusCode).toEqual(500);
  });

  it('12. should get all tasks', async () => {
    await request(app)
      .post('/tasks')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Task 1', projectId });
    
    const res = await request(app)
      .get('/tasks')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toEqual(1);
  });

  it('13. should get task by id', async () => {
    const task = await request(app)
      .post('/tasks')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Task 1', projectId });
    
    const res = await request(app)
      .get(`/tasks/${task.body._id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toEqual(200);
  });

  it('14. should update a task', async () => {
    const task = await request(app)
      .post('/tasks')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Task 1', projectId });
    
    const res = await request(app)
      .put(`/tasks/${task.body._id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'Done' });
    expect(res.statusCode).toEqual(200);
    expect(res.body.status).toEqual('Done');
  });

  it('15. should delete a task', async () => {
    const task = await request(app)
      .post('/tasks')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Task 1', projectId });
    
    const res = await request(app)
      .delete(`/tasks/${task.body._id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toEqual(200);
  });
});
