-- AlterTable
ALTER TABLE "sous_domaines" ADD COLUMN     "matiereId" TEXT;

-- AddForeignKey
ALTER TABLE "sous_domaines" ADD CONSTRAINT "sous_domaines_matiereId_fkey" FOREIGN KEY ("matiereId") REFERENCES "matieres"("id") ON DELETE SET NULL ON UPDATE CASCADE;
