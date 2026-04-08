import type { NestExpressApplication } from '@nestjs/platform-express';

import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

const logger = new Logger('Bootstrap');

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);

  app.enableCors({
    origin: config.get<string>('ALLOWED_ORIGINS')?.split(',') || [],
    credentials: true,
  });

  app.setGlobalPrefix(config.get<string>('GLOBAL_PREFIX') || 'api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const port = config.get<number>('PORT') ?? 3000;
  await app.listen(port);

  logger.log(
    `🚀 Application is running on ${await app.getUrl()}/${config.get<string>('GLOBAL_PREFIX')}`,
  );
}
void bootstrap();
