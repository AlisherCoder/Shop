import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean | any {
    let request: Request = context.switchToHttp().getRequest();
    let token = request.headers.authorization?.split(' ')[1];

    if (!token) {
      return new UnauthorizedException('Unauthorized');
    }

    try {
      let data = this.jwtService.verify(token);
      request['user'] = data;
      return true;
    } catch (error) {
      return new UnauthorizedException('Unauthorized');
    }
  }
}
