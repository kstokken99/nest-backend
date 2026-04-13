import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';

import { OtpsController } from './otps.controller';
import { OtpsService } from './otps.service';
import { RETRY_DELAY } from './constants';

describe('OtpsController', () => {
  let controller: OtpsController;

  const mockOtpsService = {
    get: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OtpsController],
      providers: [
        { provide: OtpsService, useValue: mockOtpsService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    controller = module.get<OtpsController>(OtpsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createOtp', () => {
    it('should create new OTP code', async () => {
      mockOtpsService.get.mockResolvedValue(null);
      mockOtpsService.create.mockResolvedValue({
        code: 123456,
        retryDelay: RETRY_DELAY,
        created: Date.now(),
      });
      mockConfigService.get.mockReturnValue('production');

      const result = await controller.createOtp({ phone: '89990009999' });

      expect(result.success).toBe(true);
      expect(result.retryDelay).toBe(RETRY_DELAY);
      expect(mockOtpsService.create).toHaveBeenCalledWith(
        '89990009999',
        RETRY_DELAY,
      );
    });

    it('should return remaining time if OTP already exists and not expired', async () => {
      const created = Date.now() - 50000;
      mockOtpsService.get.mockResolvedValue({
        code: 123456,
        retryDelay: RETRY_DELAY,
        created,
      });
      mockConfigService.get.mockReturnValue('production');

      const result = await controller.createOtp({ phone: '89990009999' });

      expect(result.success).toBe(true);
      expect(result.retryDelay).toBeLessThan(RETRY_DELAY);
      expect(mockOtpsService.create).not.toHaveBeenCalled();
    });

    it('should return code in dev mode', async () => {
      mockOtpsService.get.mockResolvedValue(null);
      mockOtpsService.create.mockResolvedValue({
        code: 123456,
        retryDelay: RETRY_DELAY,
        created: Date.now(),
      });
      mockConfigService.get.mockReturnValue('development');

      const result = await controller.createOtp({ phone: '89990009999' });

      expect(result.success).toBe(true);
      expect(result.code).toBe(123456);
    });

    it('should delete old OTP and create new when expired', async () => {
      const created = Date.now() - RETRY_DELAY - 1000;
      mockOtpsService.get.mockResolvedValueOnce({
        code: 123456,
        retryDelay: RETRY_DELAY,
        created,
      });
      mockOtpsService.create.mockResolvedValue({
        code: 654321,
        retryDelay: RETRY_DELAY,
        created: Date.now(),
      });
      mockConfigService.get.mockReturnValue('production');

      const result = await controller.createOtp({ phone: '89990009999' });

      expect(mockOtpsService.delete).toHaveBeenCalledWith('89990009999');
      expect(mockOtpsService.create).toHaveBeenCalledWith(
        '89990009999',
        RETRY_DELAY,
      );
      expect(result.success).toBe(true);
    });
  });

  describe('verifyOtp', () => {
    it('should verify correct code', async () => {
      mockOtpsService.get.mockResolvedValue({
        code: 123456,
        retryDelay: RETRY_DELAY,
        created: Date.now(),
      });
      mockOtpsService.delete.mockResolvedValue(true);

      const result = await controller.verifyOtp({
        phone: '89990009999',
        code: 123456,
      });

      expect(result.success).toBe(true);
      expect(mockOtpsService.delete).toHaveBeenCalledWith('89990009999');
    });

    it('should return error if OTP not found', async () => {
      mockOtpsService.get.mockResolvedValue(null);

      const result = await controller.verifyOtp({
        phone: '89990009999',
        code: 123456,
      });

      expect(result.success).toBe(false);
      expect(result.message).toBe('OTP not found');
    });

    it('should return error if code is invalid', async () => {
      mockOtpsService.get.mockResolvedValue({
        code: 123456,
        retryDelay: RETRY_DELAY,
        created: Date.now(),
      });

      const result = await controller.verifyOtp({
        phone: '89990009999',
        code: 999999,
      });

      expect(result.success).toBe(false);
      expect(result.message).toBe('Invalid code');
      expect(mockOtpsService.delete).not.toHaveBeenCalled();
    });
  });
});
