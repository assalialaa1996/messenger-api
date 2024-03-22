import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class TransformResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const res = context.switchToHttp().getResponse();

    const defaultSuccessHeader = {
      statusCode: res.statusCode,
      message: 'Operation successful',
    };

    return next.handle().pipe(
      map((data) => ({
        ...defaultSuccessHeader,
        data,
      })),
    );
  }
}
