import { Controller, Get, Render } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  MongooseHealthIndicator,
} from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private mongooseHealth: MongooseHealthIndicator,
  ) {}

  @Get('json')
  @HealthCheck()
  checkJson() {
    return this.health.check([
      async () => this.mongooseHealth.pingCheck('mongodb'),
    ]);
  }

  @Get()
  @Render('health')
  @HealthCheck()
  async check() {
    const result = await this.health.check([
      async () => this.mongooseHealth.pingCheck('mongodb'),
    ]);

    return {
      status: result.status,
      details: result.details,
      timestamp: new Date().toLocaleDateString('en', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
      }),
    };
  }
}
