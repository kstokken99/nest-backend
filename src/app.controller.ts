import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('pages')
@Controller()
export class AppController {
  constructor() {}

  @Get('/health')
  @ApiOperation({ summary: 'health check' })
  health() {
    return { status: 'ok' };
  }
}
