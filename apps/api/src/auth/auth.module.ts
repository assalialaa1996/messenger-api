import { SharedModule } from '@app/shared/modules/shared.module';
import { Module } from '@nestjs/common';
import { AuthController } from './controllers/auth.controller';

@Module({
  imports: [
    SharedModule.registerRmq('AUTH_SERVICE', process.env.RABBITMQ_AUTH_QUEUE),
  ],
  controllers: [AuthController],
})
export class AuthModule {}
