/*
  Warnings:

  - You are about to drop the column `sousDomainId` on the `matieres` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "matieres" DROP CONSTRAINT "matieres_sousDomainId_fkey";

-- AlterTable
ALTER TABLE "matieres" DROP COLUMN "sousDomainId",
ADD COLUMN     "domaineId" TEXT;

-- AlterTable
ALTER TABLE "sequences" ADD COLUMN     "sousDomainId" TEXT;

-- AddForeignKey
ALTER TABLE "matieres" ADD CONSTRAINT "matieres_domaineId_fkey" FOREIGN KEY ("domaineId") REFERENCES "domaines"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sequences" ADD CONSTRAINT "sequences_sousDomainId_fkey" FOREIGN KEY ("sousDomainId") REFERENCES "sous_domaines"("id") ON DELETE SET NULL ON UPDATE CASCADE;
