process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-that-is-long-enough';

import bcrypt from 'bcryptjs';
import request from 'supertest';
import { createApp } from '../src/app';
import { prisma } from '../src/db';

jest.mock('../src/db', () => ({
  prisma: {
    user: { findUnique: jest.fn(), create: jest.fn() },
    pet: { findMany: jest.fn() }
  }
}));

const db = prisma as any;

describe('API', () => {
  const app = createApp();

  it('reports health', async () => {
    await request(app).get('/api/health').expect(200, { status: 'ok', service: 'pawpal-api' });
  });

  it('registers a user and returns a token', async () => {
    db.user.findUnique.mockResolvedValue(null);
    db.user.create.mockResolvedValue({ id: 'user-1', name: 'Sam', email: 'sam@example.com' });
    const response = await request(app).post('/api/auth/register').send({ name: 'Sam', email: 'SAM@example.com', password: 'password123' }).expect(201);
    expect(response.body.token).toEqual(expect.any(String));
    expect(response.body.user.email).toBe('sam@example.com');
  });

  it('rejects incorrect login credentials', async () => {
    db.user.findUnique.mockResolvedValue({ id: 'user-1', email: 'sam@example.com', name: 'Sam', passwordHash: await bcrypt.hash('right-password', 4) });
    await request(app).post('/api/auth/login').send({ email: 'sam@example.com', password: 'wrong' }).expect(401);
  });

  it('requires auth for pet routes', async () => {
    await request(app).get('/api/pets').expect(401);
  });

  it('lists the authenticated owner pets', async () => {
    db.pet.findMany.mockResolvedValue([{ id: 'pet-1', name: 'Maple' }]);
    const login = await request(app).post('/api/auth/login').send({ email: 'sam@example.com', password: 'right-password' }).expect(200);
    const response = await request(app).get('/api/pets').set('Authorization', 'Bearer ' + login.body.token);
    expect(response.body).toEqual([{ id: 'pet-1', name: 'Maple' }]);
    expect(db.pet.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { ownerId: 'user-1' } }));
  });
});
