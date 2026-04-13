import { Controller, Get, Inject } from '@nestjs/common';
import { Redis } from 'ioredis';

@Controller('health')
export class HealthController {
  constructor(@Inject('REDIS_CLIENT') private redis: Redis) {}

  @Get()
  async check() {
    const result = await this.redis.ping();
    return {
      status: result === 'PONG' ? 'up' : 'down',
      redis: result === 'PONG' ? 'ok' : 'error',
    };
  }
}
