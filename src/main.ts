import './xray';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';

export async function createNestServer() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const config = new DocumentBuilder()
    .addBearerAuth()
    .setTitle('API Serverless Data Fusion')
    .setDescription('API para la fusión de datos en un entorno serverless')
    .setVersion('1.0')
    .build();

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  return app.init().then(() => app.getHttpAdapter().getInstance());
}

if (process.env.NODE_ENV !== 'production') {
  const port = process.env.PORT ? Number(process.env.PORT) : 3000;
  createNestServer().then((app) =>
    app.listen(port, () => {
      Logger.log(`🚀 Local server running on http://localhost:${port}`);
    }),
  );
}
