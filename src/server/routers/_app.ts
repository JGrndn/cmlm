import { createTRPCRouter } from '@/server/trpc';
import { ficheRouter } from './fiche';
import { itemRouter } from './item';

export const appRouter = createTRPCRouter({
  fiche: ficheRouter,
  item: itemRouter,
});

export type AppRouter = typeof appRouter;
