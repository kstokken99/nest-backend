import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const user = config.get('DATABASE_USERNAME');
        const pass = config.get('DATABASE_PASSWORD');
        const port = config.get('DATABASE_PORT');
        const db = config.get('DATABASE_NAME');

        return {
          uri: `mongodb://${user}:${pass}@localhost:${port}/${db}?authSource=admin`,
        };
      },
    }),
    HealthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
