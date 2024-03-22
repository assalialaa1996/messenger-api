import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';

import { SharedService } from '@app/shared';

import { AuthModule } from './auth.module';

import { TransformResponseInterceptor } from '@app/shared/interceptors/transform-response.interceptor';
import { ValidationPipe } from '@nestjs/common';
import { RpcExceptionFilter } from '@app/shared/filters/http-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AuthModule);

  /**
   * Transform successful responses interceptor
   */
  app.useGlobalInterceptors(new TransformResponseInterceptor());

  /**
   * Transform failure responses filter
   */

  app.useGlobalFilters(new RpcExceptionFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      stopAtFirstError: false,
    }),
  );

  const configService = app.get(ConfigService);
  const sharedService = app.get(SharedService);

  const queue = configService.get('RABBITMQ_AUTH_QUEUE');

  app.connectMicroservice(sharedService.getRmqOptions(queue));
  app.startAllMicroservices();
}
bootstrap();
