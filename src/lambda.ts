// src/lambda.ts

import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { configure as serverlessExpress } from '@vendia/serverless-express';
import { AppModule } from './app.module';
import * as express from 'express';
import { ValidationPipe } from '@nestjs/common';

// Definimos un tipo para la aplicación Express para mayor claridad
type ExpressApp = express.Application;

// Caché para la instancia del servidor
let cachedServer;

// La función ahora retorna correctamente una promesa de una aplicación Express
async function bootstrap(): Promise<ExpressApp> {
  const expressApp = express();

  const nestApp = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
  );

  // Aplica tus configuraciones globales aquí, igual que en tu main.ts
  nestApp.setGlobalPrefix('api');

  // Replicamos el ValidationPipe que tenías en tu archivo de arranque local
  nestApp.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await nestApp.init();

  // Retornamos la instancia de Express. Ahora el tipo coincide.
  return expressApp;
}

export const handler = async (event, context, callback) => {
  if (!cachedServer) {
    // La variable expressApp será del tipo correcto (ExpressApp)
    const expressApp = await bootstrap();

    // serverlessExpress recibe la app de Express sin errores de tipo
    cachedServer = serverlessExpress({ app: expressApp });
  }

  return cachedServer(event, context, callback);
};
