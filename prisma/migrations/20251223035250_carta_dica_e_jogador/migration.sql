-- CreateTable
CREATE TABLE "Jogador" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "vitorias" INTEGER NOT NULL DEFAULT 0,
    "derrotas" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Jogador_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Carta" (
    "id" SERIAL NOT NULL,
    "tipo" TEXT NOT NULL,
    "resposta" TEXT NOT NULL,
    "dificuldade" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Carta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dica" (
    "id" SERIAL NOT NULL,
    "texto" TEXT NOT NULL,
    "numero" INTEGER NOT NULL,
    "cartaId" INTEGER NOT NULL,

    CONSTRAINT "Dica_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Jogador_email_key" ON "Jogador"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Jogador_username_key" ON "Jogador"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Dica_cartaId_numero_key" ON "Dica"("cartaId", "numero");

-- AddForeignKey
ALTER TABLE "Dica" ADD CONSTRAINT "Dica_cartaId_fkey" FOREIGN KEY ("cartaId") REFERENCES "Carta"("id") ON DELETE CASCADE ON UPDATE CASCADE;
