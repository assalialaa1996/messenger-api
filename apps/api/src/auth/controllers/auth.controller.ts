import { AuthGuard, UserInterceptor, UserRequest } from '@app/shared';
import { RefreshTokenDto } from '@app/shared/dto/refresh-token.dto';
import { SendOtpDto } from '@app/shared/dto/send-otp.dto';
import { ValidateOtpDto } from '@app/shared/dto/validate-otp.dto';
import { RefreshTokenGuard } from '@app/shared/guards/refreshToken.guard';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { catchError, throwError } from 'rxjs';

@Controller('auth')
@ApiTags('Authentification')
export class AuthController {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authService: ClientProxy,
  ) {}

  @Get('users')
  async getUsers() {
    return this.authService.send(
      {
        cmd: 'get-users',
      },
      {},
    );
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @UseInterceptors(UserInterceptor)
  @Post('logout')
  async logout(@Req() req: UserRequest) {
    if (!req?.user) {
      throw new BadRequestException();
    }

    return this.authService.send(
      {
        cmd: 'logout',
      },
      {
        user: req.user,
      },
    );
  }

  @Post('send-otp')
  async sendOtp(@Body() sendOtpDto: SendOtpDto) {
    return this.authService.send(
      {
        cmd: 'send-otp',
      },
      sendOtpDto,
    );
  }

  @Post('validate-otp')
  async validateOtp(@Body() validateOtpDto: ValidateOtpDto) {
    return this.authService
      .send(
        {
          cmd: 'validate-otp',
        },
        validateOtpDto,
      )
      .pipe(
        catchError((error) =>
          throwError(() => new RpcException(error.response)),
        ),
      );
  }

  @ApiBearerAuth()
  @UseGuards(RefreshTokenGuard)
  @Post('refresh-token')
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService
      .send(
        {
          cmd: 'refresh-token',
        },
        refreshTokenDto,
      )
      .pipe(
        catchError((error) =>
          throwError(() => new RpcException(error.response)),
        ),
      );
  }
}
