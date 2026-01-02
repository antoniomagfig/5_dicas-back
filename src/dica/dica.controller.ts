import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DicaService } from './dica.service';
import { CreateDicaDto } from './dto/create-dica.dto';
import { UpdateDicaDto } from './dto/update-dica.dto';

@Controller('dica')
export class DicaController {
  constructor(private readonly dicaService: DicaService) {}

  @Post()
  create(@Body() createDicaDto: CreateDicaDto) {
    return this.dicaService.create(createDicaDto);
  }

  @Get()
  findAll() {
    return this.dicaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dicaService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDicaDto: UpdateDicaDto) {
    return this.dicaService.update(+id, updateDicaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.dicaService.remove(+id);
  }
}
