import { Module, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';

import {
  SharedModule,
  PostgresDBModule,
  SharedService,
  UserEntity,
  UsersRepository,
  CustomerEntity,
} from '@app/shared';

import { JwtGuard } from './jwt.guard';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt-strategy';
import { SmsGatewayService } from '@app/shared/services/sms-gateway.service';
import { CustomersRepository } from '@app/shared/repositories/customers.repository';
import { APP_PIPE } from '@nestjs/core';
import { RefreshTokenStrategy } from './refreshToken.strategy';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: '3600s' },
      }),
      inject: [ConfigService],
    }),

    SharedModule,
    PostgresDBModule,

    TypeOrmModule.forFeature([UserEntity, CustomerEntity]),
  ],
  controllers: [AuthController],
  providers: [
    JwtGuard,
    JwtStrategy,
    RefreshTokenStrategy,
    {
      provide: 'AuthServiceInterface',
      useClass: AuthService,
    },
    {
      provide: 'UsersRepositoryInterface',
      useClass: UsersRepository,
    },
    {
      provide: 'CustomersRepositoryInterface',
      useClass: CustomersRepository,
    },
    {
      provide: 'SharedServiceInterface',
      useClass: SharedService,
    },
    {
      provide: 'SmsGatewayServiceInterface',
      useClass: SmsGatewayService,
    },
  ],
})
export class AuthModule {}
