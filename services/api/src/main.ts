import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const logger = new Logger('PakistanSuperAppBootstrap');
  const app = await NestFactory.create(AppModule);

  // Global standard API prefix
  app.setGlobalPrefix('api/v1');

  // Enable CORS for mobile apps and admin dashboard
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Global Exception & Envelope Interceptors
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  // Swagger OpenAPI 3.1 Documentation Setup
  const config = new DocumentBuilder()
    .setTitle('Pakistan Super App - Core API Platform')
    .setDescription(
      'Authoritative backend engine powering Ride-Hailing, Roadside Mechanic Assistance, inDrive Bargaining, Home Services, and Realtime Tracking.'
    )
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 4000;
  await app.listen(port);
  logger.log(`🚀 Pakistan Super App Core API running on: http://localhost:${port}/api/v1`);
  logger.log(`📚 Swagger OpenAPI Documentation available at: http://localhost:${port}/api/docs`);
}

bootstrap();
