import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createTRPCRouter, protectedProcedure } from '@/server/trpc';
import { prisma as _db } from '@/lib/prisma';

type Db = typeof _db;

async function assertFicheOwner(prisma: Db, ficheId: string, userId: string) {
  const fiche = await prisma.fiche.findFirst({
    where: { id: ficheId, seance: { sequence: { matiere: { classeur: { userId } } } } },
  });
  if (!fiche) throw new TRPCError({ code: 'NOT_FOUND' });
  return fiche;
}

export const ficheRouter = createTRPCRouter({
  list: protectedProcedure
    .input(z.object({ seanceId: z.string() }))
    .query(async ({ ctx, input }) => {
      const seance = await ctx.prisma.seance.findFirst({
        where: {
          id: input.seanceId,
          sequence: { matiere: { classeur: { userId: ctx.session.user.id } } },
        },
      });
      if (!seance) throw new TRPCError({ code: 'NOT_FOUND' });

      return ctx.prisma.fiche.findMany({
        where: { seanceId: input.seanceId },
        orderBy: { ordre: 'asc' },
        include: { items: { orderBy: { ordre: 'asc' } } },
      });
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const fiche = await ctx.prisma.fiche.findFirst({
        where: {
          id: input.id,
          seance: { sequence: { matiere: { classeur: { userId: ctx.session.user.id } } } },
        },
        include: { items: { orderBy: { ordre: 'asc' } } },
      });
      if (!fiche) throw new TRPCError({ code: 'NOT_FOUND' });
      return fiche;
    }),

  create: protectedProcedure
    .input(z.object({ titre: z.string().min(1), seanceId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const seance = await ctx.prisma.seance.findFirst({
        where: {
          id: input.seanceId,
          sequence: { matiere: { classeur: { userId: ctx.session.user.id } } },
        },
      });
      if (!seance) throw new TRPCError({ code: 'NOT_FOUND' });

      const count = await ctx.prisma.fiche.count({ where: { seanceId: input.seanceId } });
      return ctx.prisma.fiche.create({ data: { ...input, ordre: count + 1 } });
    }),

  update: protectedProcedure
    .input(z.object({ id: z.string(), titre: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      await assertFicheOwner(ctx.prisma, id, ctx.session.user.id);
      return ctx.prisma.fiche.update({ where: { id }, data });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await assertFicheOwner(ctx.prisma, input.id, ctx.session.user.id);
      return ctx.prisma.fiche.delete({ where: { id: input.id } });
    }),

  reorder: protectedProcedure
    .input(z.object({ ids: z.array(z.string()) }))
    .mutation(async ({ ctx, input }) => {
      await Promise.all(
        input.ids.map((id, ordre) =>
          ctx.prisma.fiche.updateMany({
            where: {
              id,
              seance: { sequence: { matiere: { classeur: { userId: ctx.session.user.id } } } },
            },
            data: { ordre: ordre + 1 },
          }),
        ),
      );
    }),
});
