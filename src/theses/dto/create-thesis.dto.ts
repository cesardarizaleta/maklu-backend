import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateThesisDto {
  @ApiProperty({
    example: 'Optimización del rendimiento en APIs NestJS',
    maxLength: 256,
  })
  @IsString()
  @MinLength(1)
  @IsNotEmpty()
  @MaxLength(256)
  title!: string;
}
