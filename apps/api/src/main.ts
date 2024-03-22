import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { RpcExceptionFilter } from '@app/shared/filters/http-exceptions.filter';

import { TransformResponseInterceptor } from '@app/shared/interceptors/transform-response.interceptor';
import { ValidationPipe } from '@nestjs/common';
async function bootstrap() {
  const app = await NestFactory.create(AppModule, { abortOnError: false });
  app.enableCors();

  /**
   * Transform successful responses interceptor
   */
  app.useGlobalInterceptors(new TransformResponseInterceptor());
  app.useGlobalFilters(new RpcExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      stopAtFirstError: false,
    }),
  );

  app.setGlobalPrefix(process.env.API_PREFIX);

  const config = new DocumentBuilder()
    .setTitle('MasheApp')
    .setDescription('The MasheApp API description')
    .setVersion('1.0')
    .addTag('MasheApp')
    //.addServer(process.env.SWAGER_SERVER)
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config, {
    ignoreGlobalPrefix: false,
    deepScanRoutes: true,
  });
  SwaggerModule.setup('api-docs', app, document);

  await app.listen(5000);
}
bootstrap();
