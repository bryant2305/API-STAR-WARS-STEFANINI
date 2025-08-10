// src/lambda.ts

import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { configure as serverlessExpress } from '@vendia/serverless-express';
import { AppModule } from './app.module';
import * as express from 'express';
import { ValidationPipe } from '@nestjs/common';

type ExpressApp = express.Application;

// Caché para la instancia del servidor
let cachedServer;

async function bootstrap(): Promise<ExpressApp> {
  const expressApp = express();

  const nestApp = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
  );

  nestApp.setGlobalPrefix('api');

  nestApp.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await nestApp.init();

  return expressApp;
}

export const handler = async (event, context, callback) => {
  if (!cachedServer) {
    const expressApp = await bootstrap();

    cachedServer = serverlessExpress({ app: expressApp });
  }

  return cachedServer(event, context, callback);
};
