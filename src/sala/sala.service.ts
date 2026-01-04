import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { salasStore } from "./sala.store";
import { Sala, TotalRodadas } from "./sala.types";
import { CartaService } from "../carta/carta.service";
import { GameState } from "./sala.state";
import { JogadorService } from "src/jogador/jogador.service";

@Injectable()
export class SalaService {
  private salas = salasStore;

  // ======================
  // CACHE DE JOGADORES (evita hits repetidos no banco)
  // ======================
  private jogadoresCache = new Map<
    string,
    { id: number; username: string }[]
  >();

  private async getJogadoresDTO(
    codigo: string,
    jogadores: number[]
  ): Promise<{ id: number; username: string }[]> {
    const cached = this.jogadoresCache.get(codigo);

    // cache válido se os ids forem os mesmos
    if (
      cached &&
      cached.length === jogadores.length &&
      jogadores.every((id) => cached.some((j) => j.id === id))
    ) {
      return cached;
    }

    const jogadoresDTO = await Promise.all(
      jogadores.map(async (id) => {
        const j = await this.jogadorService.findOne(id);
        return { id: j.id, username: j.username };
      })
    );

    this.jogadoresCache.set(codigo, jogadoresDTO);
    return jogadoresDTO;
  }

  private async getUsernameById(
    codigo: string,
    jogadores: number[],
    jogadorId: number
  ): Promise<string> {
    const jogadoresDTO = await this.getJogadoresDTO(codigo, jogadores);
    const achou = jogadoresDTO.find((j) => j.id === jogadorId);

    if (achou) return achou.username;

    // fallback de segurança (não deveria acontecer)
    const j = await this.jogadorService.findOne(jogadorId);
    return j.username;
  }

  constructor(
    private readonly cartaService: CartaService,
    private readonly jogadorService: JogadorService
) {}

  /* ======================
     UTIL
  ====================== */

  private gerarCodigo(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

    async mapSalaParaDTO(sala: Sala) {
      const jogadoresDTO = await this.getJogadoresDTO(
        sala.codigo,
        sala.jogadores
      );

      return {
        ...sala,
        jogadores: jogadoresDTO,
      };
    }


  private calcularTurnoAtivo(state: GameState): number {
    if (state.fase === "escolha_dica") return state.escolhedorId;
    if (state.fase === "palpite") return state.palpiteTurnoId;
    return state.turnoJogadorId;
  }

  private criarGameStateInicial(
    jogadores: number[],
    iniciador: number,
    pontosExistentes?: Record<number, number>
  ): GameState {
    const pontos: Record<number, number> = pontosExistentes ?? {};
    jogadores.forEach((id) => {
      if (!(id in pontos)) pontos[id] = 0;
    });

    const state: GameState = {
      fase: "escolha_dica",

      iniciadorDaCartaId: iniciador,
      escolhedorId: iniciador,
      palpiteTurnoId: iniciador,
      turnoJogadorId: iniciador,

      dicasReveladas: [],
      palpites: [],
      palpitesNaDica: 0,

      mensagemFim: null,
      pontos,
    };

    state.turnoJogadorId = this.calcularTurnoAtivo(state);
    return state;
  }

  private calcularPontos(dicasReveladas: number[]) {
    return Math.max(6 - dicasReveladas.length, 0);
  }

  /* ======================
     CRUD SALA
  ====================== */

  async criarSala(
    jogadorId: number,
    totalRodadas: TotalRodadas
  ): Promise<Sala> {
    const codigo = this.gerarCodigo();
    const cartas = await this.cartaService.sortearCartas(totalRodadas);

    const sala: Sala = {
      codigo,
      jogadores: [jogadorId],
      status: "aguardando",
      totalRodadas,
      rodadaAtual: 1,
      cartas,
      gameState: this.criarGameStateInicial([jogadorId], jogadorId),
    };

    this.salas.set(codigo, sala);
    return sala;
  }

  entrarSala(codigo: string, jogadorId: number): Sala {
    const sala = this.obterSala(codigo);

    if (sala.jogadores.length >= 2) {
      throw new BadRequestException("Sala cheia");
    }

    if (!sala.jogadores.includes(jogadorId)) {
      sala.jogadores.push(jogadorId);
    }

    sala.status = "em_jogo";
    sala.gameState.pontos[jogadorId] = 0;

    return sala;
  }

  obterSala(codigo: string): Sala {
    const sala = this.salas.get(codigo);
    if (!sala) throw new NotFoundException("Sala não encontrada");
    return sala;
  }

  /* ======================
     AÇÕES DO JOGO
  ====================== */

  revelarDica(codigo: string, jogadorId: number, numero: number): Sala {
    const sala = this.obterSala(codigo);
    const s = sala.gameState;

    if (s.fase !== "escolha_dica")
      throw new BadRequestException("Não é fase de dica");
    if (s.escolhedorId !== jogadorId)
      throw new BadRequestException("Não é sua vez");
    if (s.dicasReveladas.includes(numero))
      throw new BadRequestException("Dica já revelada");

    s.dicasReveladas.push(numero);
    s.dicasReveladas.sort();

    s.fase = "palpite";
    s.palpitesNaDica = 0;
    s.palpiteTurnoId = s.escolhedorId;
    s.turnoJogadorId = this.calcularTurnoAtivo(s);

    return sala;
  }

    async palpitar(codigo: string, jogadorId: number, texto: string): Promise<Sala> {
        const sala = this.obterSala(codigo);
        const s = sala.gameState;

        /* ======================
            VALIDAÇÕES
        ====================== */
        if (s.fase !== "palpite") {
            throw new BadRequestException("Não é fase de palpite");
        }

        if (s.palpiteTurnoId !== jogadorId) {
            throw new BadRequestException("Não é sua vez");
        }

        const carta = sala.cartas[sala.rodadaAtual - 1];
        const palpiteNormalizado = texto.trim().toLowerCase();

        if (!palpiteNormalizado) {
            throw new BadRequestException("Palpite vazio");
        }

        /* ======================   
        ACERTO
        ====================== */

        const respostasValidas = [
        carta.resposta.trim().toLowerCase(),
        ];

        if (carta.aceito) {
        respostasValidas.push(carta.aceito.trim().toLowerCase());
        }

        if (respostasValidas.includes(palpiteNormalizado)) {
            const pontos = this.calcularPontos(s.dicasReveladas);

            s.pontos[jogadorId] = (s.pontos[jogadorId] ?? 0) + pontos;

            const username = await this.getUsernameById(
              sala.codigo,
              sala.jogadores,
              jogadorId
            );

            // ⚠️ SEMPRE mostra a resposta oficial
            s.mensagemFim = `🎉 ${username} acertou! A resposta era "${carta.resposta}" (+${pontos} pts)`;

            s.fase = "fim_rodada";

            s.turnoJogadorId = jogadorId;
            return sala;
        }

        /* ======================
            ERRO (somente aqui entra na lista)
        ====================== */
        s.palpites.push({
            jogadorId,
            texto: texto.trim(),
        });

        s.palpitesNaDica++;

        /* ======================
            TROCA DE TURNO
        ====================== */
        // Primeiro erro → passa a vez ao outro jogador
        if (s.palpitesNaDica === 1) {
            const outro = sala.jogadores.find((id) => id !== jogadorId);
            if (!outro) {
            throw new BadRequestException("Não há oponente");
            }

            s.palpiteTurnoId = outro;
            s.turnoJogadorId = this.calcularTurnoAtivo(s);

            return sala;
        }

        /* ======================
            DOIS ERROS → VOLTA PARA ESCOLHA DE DICA
        ====================== */
        return this.finalizarTentativasDaDica(codigo);
    }

  async pular(codigo: string, jogadorId: number): Promise<Sala> {
    const sala = this.obterSala(codigo);
    const s = sala.gameState;

    if (s.palpiteTurnoId !== jogadorId)
      throw new BadRequestException("Não é sua vez");

    s.palpites.push({ jogadorId, texto: "(pulou)" });
    s.palpitesNaDica++;

    if (s.palpitesNaDica === 1) {
      s.palpiteTurnoId = sala.jogadores.find((id) => id !== jogadorId)!;
      s.turnoJogadorId = this.calcularTurnoAtivo(s);
      return sala;
    }

    return await this.finalizarTentativasDaDica(codigo);
  }

  async finalizarTentativasDaDica(codigo: string): Promise<Sala> {
    const sala = this.obterSala(codigo);
    const s = sala.gameState;

    if (s.dicasReveladas.length >= 5) {
      const carta = sala.cartas[sala.rodadaAtual - 1];
      s.mensagemFim = `Ninguém acertou. A resposta era "${carta.resposta}"`;
      
    if (sala.rodadaAtual >= sala.totalRodadas) {
        await this.finalizarJogo(sala);
    } else {
        s.fase = "fim_rodada";
    }
      return sala;
    }

    s.escolhedorId = sala.jogadores.find(
      (id) => id !== s.escolhedorId
    )!;
    s.fase = "escolha_dica";
    s.palpitesNaDica = 0;
    s.turnoJogadorId = this.calcularTurnoAtivo(s);

    return sala;
  }

    async proximaRodada(codigo: string): Promise<Sala> {
        const sala = this.obterSala(codigo);
        const s = sala.gameState;

        // 🔒 SE O JOGO JÁ ACABOU, IGNORA
        if (s.fase === "fim_jogo") {
            return sala;
        }

        if (s.fase !== "fim_rodada") {
            throw new BadRequestException("Rodada ainda não acabou");
        }

        // 🏁 ÚLTIMA RODADA
        if (sala.rodadaAtual >= sala.totalRodadas) {
            await this.finalizarJogo(sala);
            s.fase = "fim_jogo";
            return sala;
        }

        // 🔁 PRÓXIMA RODADA
        sala.rodadaAtual++;

        const novoIniciador = sala.jogadores.find(
            (id) => id !== s.iniciadorDaCartaId
        )!;

        sala.gameState = this.criarGameStateInicial(
            sala.jogadores,
            novoIniciador,
            s.pontos
        );

        return sala;
    }

    private async finalizarJogo(sala: Sala) {
        const s = sala.gameState;
        const vencedorId = this.calcularVencedor(s.pontos);

        if (vencedorId) {
            const vencedor = await this.jogadorService.findOne(vencedorId);
            s.mensagemFim = `🏆 ${vencedor.username} venceu o jogo!`;

            const perdedorId = sala.jogadores.find((id) => id !== vencedorId)!;
            await this.jogadorService.addWinLoss(vencedorId, perdedorId);
        } else {
            s.mensagemFim = "🤝 Empate!";
        }
    }

    private calcularVencedor(pontos: Record<number, number>) {
        const entries = Object.entries(pontos); // [ [id, pts], ... ]
        entries.sort((a, b) => b[1] - a[1]);

        const [idVencedor, pontosVencedor] = entries[0];
        const [_, pontosSegundo] = entries[1];

        if (pontosVencedor === pontosSegundo) {
            return null; // empate
        }

        return Number(idVencedor);
    }
}