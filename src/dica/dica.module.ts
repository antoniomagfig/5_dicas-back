import { Module } from '@nestjs/common';
import { DicaService } from './dica.service';
import { DicaController } from './dica.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [DicaController],
  providers: [DicaService],
  imports: [PrismaModule],
})
export class DicaModule {}
