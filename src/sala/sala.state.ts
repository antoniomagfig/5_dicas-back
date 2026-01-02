export type Fase = "escolha_dica" | "palpite" | "fim_rodada" | "fim_jogo";

export type Palpite = {
  jogadorId: number;
  texto: string;
};

export type GameState = {
  fase: Fase;

  // ✅ quem começou a carta (NÃO MUDA durante a carta)
  iniciadorDaCartaId: number;

  // Quem escolhe a dica AGORA (pode alternar durante a carta)
  escolhedorId: number;

  // Quem pode palpitar agora
  palpiteTurnoId: number;

  // compatibilidade com o front (quem está "ativo" no momento)
  turnoJogadorId: number;

  dicasReveladas: number[];
  palpites: Palpite[];
  palpitesNaDica: number;

  mensagemFim: string | null;
  pontos: Record<number, number>;
};