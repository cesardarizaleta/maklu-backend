import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from '../auth.service';

export interface AuthenticatedUser {
  id: string;
  owner?: string;
  apiKey: string;
}

declare module 'express-serve-static-core' {
  interface Request {
    user?: AuthenticatedUser;
  }
}

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const authHeader =
      req.headers['authorization'] ||
      req.headers['Authorization' as keyof typeof req.headers];
    if (!authHeader || Array.isArray(authHeader)) {
      throw new UnauthorizedException('Missing Authorization header');
    }
    const [scheme, token] = authHeader.split(' ');
    if (scheme?.toLowerCase() !== 'bearer' || !token) {
      throw new UnauthorizedException('Invalid Authorization scheme');
    }
    const user = await this.authService.validateApiKey(token);
    if (!user) {
      throw new UnauthorizedException('Invalid API key');
    }
    // attach user to request with correct typing
    (req as Request & { user?: AuthenticatedUser }).user = user;
    return true;
  }
}
