/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsString, MinLength } from 'class-validator';

export class CreateThesisDto {
  @IsString()
  @MinLength(1)
  title!: string;
}
