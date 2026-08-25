import { createTRPCRouter } from '@/server/trpc';
import { referenceRouter } from './reference';
import { classeurRouter } from './classeur';
import { matiereRouter } from './matiere';
import { sequenceRouter } from './sequence';
import { ficheRouter } from './fiche';
import { phaseRouter } from './phase';
import { fichierRouter } from './fichier';

export const appRouter = createTRPCRouter({
  reference: referenceRouter,
  classeur: classeurRouter,
  matiere: matiereRouter,
  sequence: sequenceRouter,
  fiche: ficheRouter,
  phase: phaseRouter,
  fichier: fichierRouter,
});

export type AppRouter = typeof appRouter;
