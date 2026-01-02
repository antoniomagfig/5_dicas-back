// src/sala/sala.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { SalaService } from "./sala.service";

@WebSocketGateway({
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
  },
})
export class SalaGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly salaService: SalaService) {}

    private async broadcastSala(codigo: string) {
        const sala = this.salaService.obterSala(codigo);
        const salaDTO = await this.salaService.mapSalaParaDTO(sala);
        this.server.to(codigo).emit("sala:state", salaDTO);
    }

  @SubscribeMessage("sala:join")
  join(
    @MessageBody() body: { codigo: string; jogadorId: number },
    @ConnectedSocket() client: Socket
  ) {
    this.salaService.obterSala(body.codigo);
    client.join(body.codigo);
    this.broadcastSala(body.codigo);
  }

  @SubscribeMessage("jogo:revelarDica")
  revelar(@MessageBody() body: { codigo: string; jogadorId: number; numero: number }) {
    this.salaService.revelarDica(body.codigo, body.jogadorId, body.numero);
    this.broadcastSala(body.codigo);
  }

  // ✅ AGORA É ASYNC
  @SubscribeMessage("jogo:palpitar")
  async palpitar(@MessageBody() body: { codigo: string; jogadorId: number; texto: string }) {
    await this.salaService.palpitar(body.codigo, body.jogadorId, body.texto);
    this.broadcastSala(body.codigo);
  }

  @SubscribeMessage("jogo:pular")
  pular(@MessageBody() body: { codigo: string; jogadorId: number }) {
    this.salaService.pular(body.codigo, body.jogadorId);
    this.broadcastSala(body.codigo);
  }

  @SubscribeMessage("jogo:proximaRodada")
  async proximaRodada(@MessageBody() body: { codigo: string }) {
    await this.salaService.proximaRodada(body.codigo);
    await this.broadcastSala(body.codigo);
  }
}