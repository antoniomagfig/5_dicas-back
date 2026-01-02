import { Module } from '@nestjs/common';
import { CartaService } from './carta.service';
import { CartaController } from './carta.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [CartaController],
  providers: [CartaService],
  imports: [PrismaModule],
  exports: [CartaService],
})
export class CartaModule {}
