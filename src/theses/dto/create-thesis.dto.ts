/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateThesisDto {
  @IsString()
  @MinLength(1)
  @IsNotEmpty()
  @MaxLength(256)
  title!: string;
}
