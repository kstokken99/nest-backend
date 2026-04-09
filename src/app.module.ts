import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver } from '@nestjs/apollo';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import type { ApolloDriverConfig } from '@nestjs/apollo';

import { AppController } from './app.controller';
import { HealthModule } from './modules/health/health.module';
import { OtpsModule } from './modules/otps';
import path from 'path';

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
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: path.join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: false,
      useGlobalPrefix: true,
      introspection: true,
      plugins: [ApolloServerPluginLandingPageLocalDefault()],
      formatError: (error: any) => {
        const graphQLFormattedError = {
          message:
            error.extensions?.exception?.response?.message || error.message,
          code: error.extensions?.code || 'SERVER_ERROR',
          name: error.extensions?.exception?.name || error.name,
        };
        return graphQLFormattedError;
      },
      context: ({ req, res }) => ({ req, res }),
    }),
    HealthModule,
    OtpsModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
