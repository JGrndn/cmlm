-- Rename domaines → disciplines (en premier pour éviter un conflit de nom)
ALTER TABLE "domaines" RENAME TO "disciplines";
ALTER TABLE "disciplines" RENAME CONSTRAINT "domaines_pkey" TO "disciplines_pkey";
ALTER TABLE "disciplines" RENAME CONSTRAINT "domaines_cycleId_fkey" TO "disciplines_cycleId_fkey";

-- Rename sous_domaines → domaines
ALTER TABLE "sous_domaines" RENAME TO "domaines";
ALTER TABLE "domaines" RENAME CONSTRAINT "sous_domaines_pkey" TO "domaines_pkey";
ALTER TABLE "domaines" RENAME COLUMN "domaineId" TO "disciplineId";
ALTER TABLE "domaines" RENAME CONSTRAINT "sous_domaines_domaineId_fkey" TO "domaines_disciplineId_fkey";
ALTER TABLE "domaines" RENAME CONSTRAINT "sous_domaines_matiereId_fkey" TO "domaines_matiereId_fkey";

-- Rename colonnes sur matieres
ALTER TABLE "matieres" RENAME COLUMN "domaineId" TO "disciplineId";
ALTER TABLE "matieres" RENAME COLUMN "sousDomainIdsVisibles" TO "domaineIdsVisibles";
ALTER TABLE "matieres" RENAME CONSTRAINT "matieres_domaineId_fkey" TO "matieres_disciplineId_fkey";

-- Rename colonne sur sequences
ALTER TABLE "sequences" RENAME COLUMN "sousDomainId" TO "domaineId";
ALTER TABLE "sequences" RENAME CONSTRAINT "sequences_sousDomainId_fkey" TO "sequences_domaineId_fkey";
