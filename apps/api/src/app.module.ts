import { Module, ValidationPipe } from '@nestjs/common';

import { SharedModule } from '@app/shared';

import { AppController } from './app.controller';
import { SwaggerModule } from '@nestjs/swagger';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    SharedModule.registerRmq('AUTH_SERVICE', process.env.RABBITMQ_AUTH_QUEUE),
    SwaggerModule,
    AuthModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
