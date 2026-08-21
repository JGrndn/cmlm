import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '@/server/trpc';

export const referenceRouter = createTRPCRouter({
  listNiveaux: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.niveauScolaire.findMany({
      orderBy: { ordre: 'asc' },
      include: { cycle: true },
    });
  }),

  listAnnees: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.anneeScolaire.findMany({ orderBy: { debut: 'asc' } });
  }),

  listDomaines: protectedProcedure
    .input(z.object({ cycleId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.domaine.findMany({
        where: { cycleId: input.cycleId },
        include: { sousDomaines: true },
        orderBy: { label: 'asc' },
      });
    }),
});
