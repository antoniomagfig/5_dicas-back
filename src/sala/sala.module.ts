import { Module } from "@nestjs/common";
import { SalaService } from "./sala.service";
import { SalaController } from "./sala.controller";
import { SalaGateway } from "./sala.gateway";
import { CartaModule } from "../carta/carta.module";
import { JogadorModule } from "../jogador/jogador.module";

@Module({
  imports: [CartaModule, JogadorModule],
  providers: [SalaService, SalaGateway],
  controllers: [SalaController],
})
export class SalaModule {}