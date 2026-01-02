import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCartaDto } from './dto/create-carta.dto';
import { UpdateCartaDto } from './dto/update-carta.dto';

@Injectable()
export class CartaService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateCartaDto) {
    return this.prisma.carta.create({ data: dto });
  }

  findAll() {
    return this.prisma.carta.findMany({ include: { dicas: true } });
  }

  async findOne(id: number) {
    const carta = await this.prisma.carta.findUnique({
      where: { id },
      include: { dicas: true },
    });
    if (!carta) throw new NotFoundException('Carta não encontrada');
    return carta;
  }

  async update(id: number, dto: UpdateCartaDto) {
    await this.findOne(id);
    return this.prisma.carta.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.carta.delete({ where: { id } });
  }

  async sortearCartas(qtd: number) {
    const cartas = await this.prisma.carta.findMany({
      select: {
        id: true,
        tipo: true,
        resposta: true,
        aceito: true,         
        dificuldade: true,
        dicas: {
          orderBy: { numero: "asc" },
          select: { id: true, numero: true, texto: true },
        },
      },
    });

    for (let i = cartas.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cartas[i], cartas[j]] = [cartas[j], cartas[i]];
    }

    return cartas.slice(0, qtd);
  }
}