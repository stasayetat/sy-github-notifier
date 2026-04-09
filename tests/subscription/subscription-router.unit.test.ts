import express from 'express';
import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { subscriptionRouter } from '../../src/modules/subscription/subcription.controller';


const app = express();
app.use(express.json());
app.use('/api', subscriptionRouter);

describe('POST /api/subscribe', () => {
  it('should return 422 for invalid email', async () => {
    const res = await request(app)
      .post('/api/subscribe')
      .send({ email: 'not-an-email', repo: 'owner/repo' });

    expect(res.status).toBe(400);
  });

  it('should return 422 for invalid repo format', async () => {
    const res = await request(app)
      .post('/api/subscribe')
      .send({ email: 'test@gmail.com', repo: 'invalid-repo' });

    expect(res.status).toBe(400);
  });

  it('should return 422 for missing fields', async () => {
    const res = await request(app)
      .post('/api/subscribe')
      .send({});

    expect(res.status).toBe(400);
  });
});

describe('GET /api/confirm/:token', () => {
  it('should return 422 for invalid token', async () => {
    const res = await request(app)
      .get('/api/confirm/not-a-uuid');

    expect(res.status).toBe(400);
  });
});

describe('GET /api/unsubscribe/:token', () => {
  it('should return 422 for invalid token', async () => {
    const res = await request(app)
      .get('/api/unsubscribe/not-a-uuid');

    expect(res.status).toBe(400);
  });
});

describe('GET /api/subscriptions', () => {
  it('should return 422 for invalid email', async () => {
    const res = await request(app)
      .get('/api/subscriptions?email=not-an-email');

    expect(res.status).toBe(400);
  });

  it('should return 422 for missing email', async () => {
    const res = await request(app)
      .get('/api/subscriptions');

    expect(res.status).toBe(400);
  });
});
