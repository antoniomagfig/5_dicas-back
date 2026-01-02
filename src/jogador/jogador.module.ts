import { Module } from '@nestjs/common';
import { JogadorService } from './jogador.service';
import { JogadorController } from './jogador.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [JogadorController],
  providers: [JogadorService],
  imports: [PrismaModule],
  exports: [JogadorService],
})
export class JogadorModule {}
