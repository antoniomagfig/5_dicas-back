import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { PrismaModule } from './prisma/prisma.module';
import { JogadorModule } from './jogador/jogador.module';
import { CartaModule } from './carta/carta.module';
import { DicaModule } from './dica/dica.module';
import { SalaModule } from './sala/sala.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    JogadorModule,
    CartaModule,
    DicaModule,
    SalaModule,
  ],
})
export class AppModule {}
