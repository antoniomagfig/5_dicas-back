import { IsInt, IsNotEmpty, IsString, Min, Max } from 'class-validator';

export class CreateDicaDto {
  @IsString()
  @IsNotEmpty()
  texto: string;

  @IsInt()
  @Min(1)
  @Max(5)
  numero: number;

  @IsInt()
  cartaId: number;
}
