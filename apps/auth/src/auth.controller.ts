import { Controller, UseGuards, Inject } from '@nestjs/common';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';

import { SharedService } from '@app/shared';

import { AuthService } from './auth.service';
import { ExistingUserDTO } from './dtos/existing-user.dto';
import { JwtGuard } from './jwt.guard';
import { SendOtpDto } from '@app/shared/dto/send-otp.dto';
import { ValidateOtpDto } from '@app/shared/dto/validate-otp.dto';
import { RefreshTokenDto } from '@app/shared/dto/refresh-token.dto';

@Controller()
export class AuthController {
  constructor(
    @Inject('AuthServiceInterface')
    private readonly authService: AuthService,
    @Inject('SharedServiceInterface')
    private readonly sharedService: SharedService,
  ) {}

  @MessagePattern({ cmd: 'get-users' })
  async getUsers(@Ctx() context: RmqContext) {
    this.sharedService.acknowledgeMessage(context);

    return this.authService.getUsers();
  }

  @MessagePattern({ cmd: 'get-user' })
  async getUserById(
    @Ctx() context: RmqContext,
    @Payload() user: { id: string },
  ) {
    this.sharedService.acknowledgeMessage(context);

    return this.authService.getUserById(user.id);
  }

  @MessagePattern({ cmd: 'send-otp' })
  async sendOtp(@Ctx() context: RmqContext, @Payload() sendOtpDto: SendOtpDto) {
    this.sharedService.acknowledgeMessage(context);

    return this.authService.sendOtp(sendOtpDto);
  }

  @MessagePattern({ cmd: 'validate-otp' })
  async validateOtp(
    @Ctx() context: RmqContext,
    @Payload() validateOtpDto: ValidateOtpDto,
  ) {
    this.sharedService.acknowledgeMessage(context);

    try {
      return this.authService.validateOtp(validateOtpDto);
    } catch (error) {
      return error;
    }
  }

  @MessagePattern({ cmd: 'refresh-token' })
  async refreshTokens(
    @Ctx() context: RmqContext,
    @Payload() refreshTokenDto: RefreshTokenDto,
  ) {
    this.sharedService.acknowledgeMessage(context);

    try {
      return this.authService.refreshTokens(refreshTokenDto);
    } catch (error) {
      return error;
    }
  }

  @MessagePattern({ cmd: 'login' })
  async login(
    @Ctx() context: RmqContext,
    @Payload() existingUser: ExistingUserDTO,
  ) {
    this.sharedService.acknowledgeMessage(context);

    return this.authService.login(existingUser);
  }

  @MessagePattern({ cmd: 'verify-jwt' })
  @UseGuards(JwtGuard)
  async verifyJwt(
    @Ctx() context: RmqContext,
    @Payload() payload: { jwt: string },
  ) {
    this.sharedService.acknowledgeMessage(context);

    return this.authService.verifyJwt(payload.jwt);
  }

  @MessagePattern({ cmd: 'logout' })
  async logout(@Ctx() context: RmqContext, @Payload() user: { id: string }) {
    this.sharedService.acknowledgeMessage(context);

    return this.authService.logout(user.id);
  }

  @MessagePattern({ cmd: 'decode-jwt' })
  async decodeJwt(
    @Ctx() context: RmqContext,
    @Payload() payload: { jwt: string },
  ) {
    this.sharedService.acknowledgeMessage(context);

    return this.authService.getUserFromHeader(payload.jwt);
  }
}
