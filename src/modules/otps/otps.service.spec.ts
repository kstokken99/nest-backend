import { Test, TestingModule } from '@nestjs/testing';

import { OtpsService } from './otps.service';
import { RETRY_DELAY } from './constants';

const REDIS_CLIENT = 'REDIS_CLIENT';

describe('OtpsService', () => {
  let service: OtpsService;
  let redis: { get: jest.Mock; set: jest.Mock; del: jest.Mock };

  beforeEach(async () => {
    redis = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [OtpsService, { provide: REDIS_CLIENT, useValue: redis }],
    }).compile();

    service = module.get<OtpsService>(OtpsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('get', () => {
    it('should return null if OTP not found', async () => {
      redis.get.mockResolvedValue(null);

      const result = await service.get('89990009999');

      expect(result).toBeNull();
      expect(redis.get).toHaveBeenCalledWith('otp:89990009999');
    });

    it('should return parsed OTP data', async () => {
      const otpData = {
        code: 123456,
        retryDelay: RETRY_DELAY,
        created: Date.now(),
      };
      redis.get.mockResolvedValue(JSON.stringify(otpData));

      const result = await service.get('89990009999');

      expect(result).toEqual(otpData);
    });
  });

  describe('set', () => {
    it('should set OTP with expiration', async () => {
      redis.set.mockResolvedValue('OK');

      await service.set('89990009999', 123456, RETRY_DELAY);

      expect(redis.set).toHaveBeenCalledWith(
        'otp:89990009999',
        expect.any(String),
        'EX',
        RETRY_DELAY,
      );
    });
  });

  describe('create', () => {
    it('should create OTP with 6-digit code', async () => {
      redis.set.mockResolvedValue('OK');

      const result = await service.create('89990009999');

      expect(result.code).toBeGreaterThanOrEqual(100000);
      expect(result.code).toBeLessThanOrEqual(999999);
      expect(result.retryDelay).toBe(RETRY_DELAY);
      expect(result.created).toBeDefined();
    });
  });

  describe('delete', () => {
    it('should delete OTP from Redis', async () => {
      redis.del.mockResolvedValue(1);

      await service.delete('89990009999');

      expect(redis.del).toHaveBeenCalledWith('otp:89990009999');
    });
  });
});
