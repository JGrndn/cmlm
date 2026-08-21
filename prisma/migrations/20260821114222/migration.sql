/*
  Warnings:

  - You are about to drop the column `userId` on the `fiches` table. All the data in the column will be lost.
  - Added the required column `ordre` to the `fiches` table without a default value. This is not possible if the table is not empty.
  - Added the required column `seanceId` to the `fiches` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Periode" AS ENUM ('P1', 'P2', 'P3', 'P4', 'P5');

-- DropForeignKey
ALTER TABLE "items" DROP CONSTRAINT "items_ficheId_fkey";

-- AlterTable
ALTER TABLE "fiches" DROP COLUMN "userId",
ADD COLUMN     "ordre" INTEGER NOT NULL,
ADD COLUMN     "seanceId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "items" ADD COLUMN     "duree" INTEGER;

-- CreateTable
CREATE TABLE "cycles" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,

    CONSTRAINT "cycles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "niveaux_scolaires" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "ordre" INTEGER NOT NULL,
    "cycleId" TEXT NOT NULL,

    CONSTRAINT "niveaux_scolaires_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "annees_scolaires" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "debut" INTEGER NOT NULL,
    "fin" INTEGER NOT NULL,

    CONSTRAINT "annees_scolaires_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "domaines" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "cycleId" TEXT NOT NULL,

    CONSTRAINT "domaines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sous_domaines" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "domaineId" TEXT NOT NULL,

    CONSTRAINT "sous_domaines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "classeurs" (
    "id" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "niveauId" TEXT NOT NULL,
    "anneeScolaireId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "classeurs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "matieres" (
    "id" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "classeurId" TEXT NOT NULL,
    "sousDomainId" TEXT,
    "ordre" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "matieres_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sequences" (
    "id" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "matiereId" TEXT NOT NULL,
    "periode" "Periode",
    "objectifs" TEXT,
    "ordre" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sequences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seances" (
    "id" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "sequenceId" TEXT NOT NULL,
    "date" TIMESTAMP(3),
    "ordre" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seances_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cycles_code_key" ON "cycles"("code");

-- CreateIndex
CREATE UNIQUE INDEX "niveaux_scolaires_code_key" ON "niveaux_scolaires"("code");

-- CreateIndex
CREATE UNIQUE INDEX "annees_scolaires_label_key" ON "annees_scolaires"("label");

-- AddForeignKey
ALTER TABLE "niveaux_scolaires" ADD CONSTRAINT "niveaux_scolaires_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "cycles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "domaines" ADD CONSTRAINT "domaines_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "cycles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sous_domaines" ADD CONSTRAINT "sous_domaines_domaineId_fkey" FOREIGN KEY ("domaineId") REFERENCES "domaines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "classeurs" ADD CONSTRAINT "classeurs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "classeurs" ADD CONSTRAINT "classeurs_niveauId_fkey" FOREIGN KEY ("niveauId") REFERENCES "niveaux_scolaires"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "classeurs" ADD CONSTRAINT "classeurs_anneeScolaireId_fkey" FOREIGN KEY ("anneeScolaireId") REFERENCES "annees_scolaires"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matieres" ADD CONSTRAINT "matieres_classeurId_fkey" FOREIGN KEY ("classeurId") REFERENCES "classeurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matieres" ADD CONSTRAINT "matieres_sousDomainId_fkey" FOREIGN KEY ("sousDomainId") REFERENCES "sous_domaines"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sequences" ADD CONSTRAINT "sequences_matiereId_fkey" FOREIGN KEY ("matiereId") REFERENCES "matieres"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seances" ADD CONSTRAINT "seances_sequenceId_fkey" FOREIGN KEY ("sequenceId") REFERENCES "sequences"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fiches" ADD CONSTRAINT "fiches_seanceId_fkey" FOREIGN KEY ("seanceId") REFERENCES "seances"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_ficheId_fkey" FOREIGN KEY ("ficheId") REFERENCES "fiches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
