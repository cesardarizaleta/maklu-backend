import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateThesisFromIdeaDto {
  @ApiProperty({
    example:
      'Plataforma de aprendizaje adaptativo con IA para mejorar el rendimiento académico en bachillerato',
    minLength: 5,
  })
  @IsString()
  @MinLength(5)
  idea!: string;

  @ApiPropertyOptional({
    example: 'Ingeniería de Software',
    maxLength: 64,
    description: 'Rama/disciplina académica que guiará el estilo del contenido',
  })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  discipline?: string;
}
