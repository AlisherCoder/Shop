import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class SelfGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    let request: Request = context.switchToHttp().getRequest();
    let { id } = request.params;
    if (request['user'].id == id || request['user'].role == 'ADMIN') {
      return true;
    }
    return false;
  }
}
