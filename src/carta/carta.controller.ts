import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CartaService } from './carta.service';
import { CreateCartaDto } from './dto/create-carta.dto';
import { UpdateCartaDto } from './dto/update-carta.dto';

@Controller('carta')
export class CartaController {
  constructor(private readonly cartaService: CartaService) {}

  @Post()
  create(@Body() createCartaDto: CreateCartaDto) {
    return this.cartaService.create(createCartaDto);
  }

  @Get()
  findAll() {
    return this.cartaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cartaService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCartaDto: UpdateCartaDto) {
    return this.cartaService.update(+id, updateCartaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cartaService.remove(+id);
  }
}
