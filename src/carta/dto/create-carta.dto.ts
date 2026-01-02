import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateCartaDto {
  @IsString()
  @IsNotEmpty()
  tipo: string;

  @IsString()
  @IsNotEmpty()
  resposta: string;

  @IsOptional()
  @IsString()
  aceito?: string | null;

  @IsInt()
  dificuldade: number;
}
