import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateJogadorDto } from './dto/create-jogador.dto';
import { UpdateJogadorDto } from './dto/update-jogador.dto';

@Injectable()
export class JogadorService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateJogadorDto) {
    const emailExists = await this.prisma.jogador.findUnique({
      where: { email: dto.email },
    });

    if (emailExists) {
      throw new ConflictException("Email já utilizado");
    }

    return this.prisma.jogador.create({
      data: {
        email: dto.email,
        username: dto.username,
      },
    });
  }

  findAll() {
    return this.prisma.jogador.findMany();
  }

  async findOne(id: number) {
    if (typeof id !== "number" || !Number.isInteger(id)) {
      throw new BadRequestException("ID de jogador inválido");
    }

    const jogador = await this.prisma.jogador.findUnique({
      where: { id },
    });

    if (!jogador) {
      throw new NotFoundException("Jogador não encontrado");
    }

    return jogador;
  }

  async update(id: number, dto: UpdateJogadorDto) {
    await this.findOne(id);
    return this.prisma.jogador.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.jogador.delete({ where: { id } });
  }

  async findByEmail(email: string) {
    const jogador = await this.prisma.jogador.findUnique({
      where: { email },
    });

    if (!jogador) {
      throw new NotFoundException("Jogador não encontrado");
    }

    return jogador;
  }

  async addWinLoss(vencedorId: number, perdedorId: number) {
    await this.prisma.jogador.update({
      where: { id: vencedorId },
      data: { vitorias: { increment: 1 } },
    });

    await this.prisma.jogador.update({
      where: { id: perdedorId },
      data: { derrotas: { increment: 1 } },
    });
  }
}