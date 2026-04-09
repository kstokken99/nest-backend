import type { NestExpressApplication } from '@nestjs/platform-express';

import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

import { join } from 'path';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

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

  const restConfig = new DocumentBuilder()
    .setTitle('@a.ivanov backend 🚀')
    .setDescription('Апишка для практики')
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    })
    .build();

  SwaggerModule.setup(
    `${config.get<string>('GLOBAL_PREFIX')}/docs`,
    app,
    SwaggerModule.createDocument(app, restConfig),
  );

  app.setBaseViewsDir(join(__dirname, 'static/views'));
  app.setViewEngine('hbs');

  const port = config.get<number>('PORT') ?? 3000;
  await app.listen(port);

  logger.log(
    `🚀 Application is running on ${await app.getUrl()}/${config.get<string>('GLOBAL_PREFIX')}`,
  );
}
void bootstrap();
