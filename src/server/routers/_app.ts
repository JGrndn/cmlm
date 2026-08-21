import { createTRPCRouter } from '@/server/trpc';
import { referenceRouter } from './reference';
import { classeurRouter } from './classeur';
import { matiereRouter } from './matiere';
import { sequenceRouter } from './sequence';
import { seanceRouter } from './seance';
import { ficheRouter } from './fiche';
import { itemRouter } from './item';

export const appRouter = createTRPCRouter({
  reference: referenceRouter,
  classeur: classeurRouter,
  matiere: matiereRouter,
  sequence: sequenceRouter,
  seance: seanceRouter,
  fiche: ficheRouter,
  item: itemRouter,
});

export type AppRouter = typeof appRouter;
