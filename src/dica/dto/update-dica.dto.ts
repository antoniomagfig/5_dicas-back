import { PartialType } from '@nestjs/mapped-types';
import { CreateDicaDto } from './create-dica.dto';

export class UpdateDicaDto extends PartialType(CreateDicaDto) {}
