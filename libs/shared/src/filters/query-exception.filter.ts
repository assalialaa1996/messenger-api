import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { Request, Response } from 'express';
import { DatabaseQueryErrors } from '../enums/typeorm-errors.enum';

@Catch(QueryFailedError)
export class QueryExceptionFilter implements ExceptionFilter {
  catch(err: { code: string } & QueryFailedError, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    const request = host.switchToHttp().getRequest<Request>();

    let status;
    let message;
    if (
      err.code === DatabaseQueryErrors.DUPLICATION ||
      err.code === DatabaseQueryErrors.DUPLICATION_REFERENCE
    ) {
      status = HttpStatus.CONFLICT;
      message = 'ALREADY_EXISTS';
    } else if (
      err.code === DatabaseQueryErrors.ROW_IS_REFERENCED ||
      err.code === DatabaseQueryErrors.KEY_IS_REFERENCED
    ) {
      status = HttpStatus.CONFLICT;
      message = 'CONFLICT';
    }

    return response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
      data: null,
    });
  }
}
