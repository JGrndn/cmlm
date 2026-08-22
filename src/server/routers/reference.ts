import { z } from 'zod';
import { TRPCError } from '@trpc/server';
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

  createSousDomaine: protectedProcedure
    .input(z.object({ domaineId: z.string(), label: z.string().min(1), matiereId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.sousDomaine.create({
        data: { domaineId: input.domaineId, label: input.label, matiereId: input.matiereId },
      });
    }),

  deleteSousDomaine: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const sd = await ctx.prisma.sousDomaine.findFirst({
        where: {
          id: input.id,
          matiereId: { not: null },
          matiere: { classeur: { userId: ctx.session.user.id } },
        },
      });
      if (!sd) throw new TRPCError({ code: 'NOT_FOUND' });
      return ctx.prisma.sousDomaine.delete({ where: { id: input.id } });
    }),
});
