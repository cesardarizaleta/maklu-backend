import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';
import type { ApiResponse } from '../common/responses/api-response';
import { ok } from '../common/responses/api-response';

class CreateApiKeyDto {
  @IsString()
  @IsNotEmpty()
  @Length(3, 32)
  @Matches(/^[a-zA-Z0-9]+$/, {
    message: 'owner must be alphanumeric without spaces',
  })
  owner!: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('apikey')
  async createApiKey(@Body() body: CreateApiKeyDto): Promise<ApiResponse> {
    const owner = body.owner.trim();
    if (!/^[a-zA-Z0-9]+$/.test(owner)) {
      throw new BadRequestException(
        'owner must be alphanumeric without spaces',
      );
    }
    const user = await this.authService.issueApiKey(owner);
    return ok(
      { apiKey: user.apiKey, user: { id: user.id, owner: user.owner } },
      'API key issued',
    );
  }
}
