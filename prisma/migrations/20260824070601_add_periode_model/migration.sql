/*
  Warnings:

  - The `periodesVisibles` column on the `matieres` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `periode` on the `sequences` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "matieres" DROP COLUMN "periodesVisibles",
ADD COLUMN     "periodesVisibles" TEXT[];

-- AlterTable
ALTER TABLE "sequences" DROP COLUMN "periode",
ADD COLUMN     "periodeId" TEXT;

-- DropEnum
DROP TYPE "Periode";

-- CreateTable
CREATE TABLE "periodes" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "dateDebut" TIMESTAMP(3) NOT NULL,
    "dateFin" TIMESTAMP(3) NOT NULL,
    "anneeScolaireId" TEXT NOT NULL,

    CONSTRAINT "periodes_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "periodes" ADD CONSTRAINT "periodes_anneeScolaireId_fkey" FOREIGN KEY ("anneeScolaireId") REFERENCES "annees_scolaires"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sequences" ADD CONSTRAINT "sequences_periodeId_fkey" FOREIGN KEY ("periodeId") REFERENCES "periodes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
