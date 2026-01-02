import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { JogadorService } from './jogador.service';
import { CreateJogadorDto } from './dto/create-jogador.dto';
import { UpdateJogadorDto } from './dto/update-jogador.dto';

@Controller('jogador')
export class JogadorController {
  constructor(private readonly jogadorService: JogadorService) {}

  @Post()
  create(@Body() createJogadorDto: CreateJogadorDto) {
    return this.jogadorService.create(createJogadorDto);
  }

  @Get()
  findAll() {
    return this.jogadorService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.jogadorService.findOne(+id);
  }

  @Get("email/:email")
async findByEmail(@Param("email") email: string) {
  return this.jogadorService.findByEmail(email);
}

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateJogadorDto: UpdateJogadorDto) {
    return this.jogadorService.update(+id, updateJogadorDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.jogadorService.remove(+id);
  }
}
