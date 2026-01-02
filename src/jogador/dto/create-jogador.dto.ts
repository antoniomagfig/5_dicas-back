import { IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateJogadorDto {
  @IsString()
  username: string;

  @IsEmail()
  email: string;

  @IsOptional()
  vitorias?: number;

  @IsOptional()
  derrotas?: number;
}
