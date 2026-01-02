import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDicaDto } from './dto/create-dica.dto';
import { UpdateDicaDto } from './dto/update-dica.dto';

@Injectable()
export class DicaService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateDicaDto) {
    // garante que a carta existe
    const carta = await this.prisma.carta.findUnique({ where: { id: dto.cartaId } });
    if (!carta) throw new BadRequestException('cartaId inválido');

    // @@unique([cartaId, numero]) vai impedir duplicata no banco
    return this.prisma.dica.create({ data: dto });
  }

  findAll() {
    return this.prisma.dica.findMany({ include: { carta: true } });
  }

  async findOne(id: number) {
    const dica = await this.prisma.dica.findUnique({ where: { id }, include: { carta: true } });
    if (!dica) throw new NotFoundException('Dica não encontrada');
    return dica;
  }

  async update(id: number, dto: UpdateDicaDto) {
    await this.findOne(id);
    return this.prisma.dica.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.dica.delete({ where: { id } });
  }
}