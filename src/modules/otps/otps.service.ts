import { Injectable, Inject } from '@nestjs/common';
import Redis from 'ioredis';

import { RETRY_DELAY } from './constants';
import type { OtpData } from './models';

@Injectable()
export class OtpsService {
  private readonly OTP_PREFIX = 'otp:';

  constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) {}

  private getKey(phone: string): string {
    return `${this.OTP_PREFIX}${phone}`;
  }

  async get(phone: string): Promise<OtpData | null> {
    const data = await this.redis.get(this.getKey(phone));
    if (!data) return null;
    return JSON.parse(data);
  }

  async set(
    phone: string,
    code: number,
    retryDelay: number = RETRY_DELAY,
  ): Promise<void> {
    const data: OtpData = {
      code,
      retryDelay,
      created: Date.now(),
    };
    await this.redis.set(
      this.getKey(phone),
      JSON.stringify(data),
      'EX',
      retryDelay,
    );
  }

  async create(
    phone: string,
    retryDelay: number = RETRY_DELAY,
  ): Promise<OtpData> {
    const code = Math.floor(100000 + Math.random() * 900000);
    await this.set(phone, code, retryDelay);
    return { code, retryDelay, created: Date.now() };
  }

  async delete(phone: string): Promise<void> {
    await this.redis.del(this.getKey(phone));
  }
}
