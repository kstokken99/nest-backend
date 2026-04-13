import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import Redis from 'ioredis';

import { AppModule } from '../src/app.module';

describe('OtpsController (e2e)', () => {
  let app: INestApplication;
  let redis: Redis;

  beforeAll(async () => {
    redis = new Redis({
      host: 'localhost',
      port: 6379,
    });

    const module = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider('REDIS_CLIENT')
      .useValue(redis)
      .compile();

    app = module.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await redis.quit();
  });

  describe('/api/auth/otp (POST)', () => {
    it('should create OTP code', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/otp')
        .send({ phone: '89990009999' })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.retryDelay).toBeDefined();
    });

    it('should return 400 for invalid phone', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/otp')
        .send({ phone: '' })
        .expect(400);
    });

    it('should return 400 for missing phone', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/otp')
        .send({})
        .expect(400);
    });
  });

  describe('/api/auth/otp/verify (POST)', () => {
    it('should verify correct code', async () => {
      const phone = '89990008888';

      const otpResponse = await request(app.getHttpServer())
        .post('/api/auth/otp')
        .send({ phone });

      const code = otpResponse.body.code;

      const verifyResponse = await request(app.getHttpServer())
        .post('/api/auth/otp/verify')
        .send({ phone, code });

      expect(verifyResponse.body.success).toBe(true);
    });

    it('should return error for invalid code', async () => {
      const phone = '89990007777';

      await request(app.getHttpServer()).post('/api/auth/otp').send({ phone });

      const response = await request(app.getHttpServer())
        .post('/api/auth/otp/verify')
        .send({ phone, code: 999999 });

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid code');
    });
  });

  describe('/api/health (GET)', () => {
    it('should return health status', async () => {
      const response = await request(app.getHttpServer()).get('/api/health');

      expect(response.body.status).toBeDefined();
    });
  });
});
