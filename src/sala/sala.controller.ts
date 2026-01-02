// src/sala/sala.controller.ts
import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  BadRequestException,
} from "@nestjs/common";

import { SalaService } from "./sala.service";
import { TotalRodadas } from "./sala.types";
import { JogadorService } from "../jogador/jogador.service";

@Controller("sala")
export class SalaController {
  constructor(
    private readonly salaService: SalaService,
    private readonly jogadorService: JogadorService
  ) {}

  /* =========================
     🔁 MAP PARA DTO (APENAS GET)
     ========================= */
  private async mapSalaParaDTO(sala: any) {
    const jogadoresIds = sala.jogadores.filter(
      (id: any) => typeof id === "number"
    );

    const jogadoresDTO = await Promise.all(
      jogadoresIds.map(async (id: number) => {
        const jogador = await this.jogadorService.findOne(id);
        return {
          id: jogador.id,
          username: jogador.username,
        };
      })
    );

    return {
      ...sala,
      jogadores: jogadoresDTO,
    };
  }

  /* =========================
     ROTAS
     ========================= */

  @Post("criar")
  async criar(
    @Body("jogadorId") jogadorId: number,
    @Body("totalRodadas") totalRodadas: number
  ) {
    if (!jogadorId) {
      throw new BadRequestException("jogadorId é obrigatório");
    }

    if (![5, 10, 15].includes(totalRodadas)) {
      throw new BadRequestException(
        "totalRodadas deve ser 5, 10 ou 15"
      );
    }

    // ❗ NÃO FAZ MAP AQUI
    return this.salaService.criarSala(
      jogadorId,
      totalRodadas as TotalRodadas
    );
  }

  @Post("entrar")
  entrar(
    @Body("codigo") codigo: string,
    @Body("jogadorId") jogadorId: number
  ) {
    if (!jogadorId) {
      throw new BadRequestException("jogadorId é obrigatório");
    }

    // ❗ NÃO FAZ MAP AQUI
    return this.salaService.entrarSala(codigo, jogadorId);
  }

  @Get(":codigo")
  async obter(@Param("codigo") codigo: string) {
    const sala = this.salaService.obterSala(codigo);
    return this.mapSalaParaDTO(sala);
  }
}