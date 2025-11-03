/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateThesisFromIdeaDto {
  @IsString()
  @MinLength(5)
  idea!: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  discipline?: string;
}
