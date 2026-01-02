// src/sala/sala.types.ts
import { GameState } from "./sala.state";

// ⚠️ se você usa Prisma com dicas incluídas, NÃO use `Carta` puro.
// Defina um tipo compatível com o que você retorna do sortearCartas.
export type DicaDTO = {
  id: number;
  numero: number;
  texto: string;
};

export type CartaDTO = {
  id: number;
  tipo: string;
  resposta: string;
  aceito?: string | null;
  dificuldade: number;
  dicas: DicaDTO[];
};

export type TotalRodadas = 5 | 10 | 15;

export type Sala = {
  codigo: string;

  // ✅ no back pode ser só number[] (mas se você já mudou para objetos no controller, alinhe)
  jogadores: number[];

  status: "aguardando" | "em_jogo";
  totalRodadas: TotalRodadas;
  rodadaAtual: number;

  // ✅ cartas já com dicas
  cartas: CartaDTO[];

  gameState: GameState;
};