import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createTRPCRouter, protectedProcedure } from '@/server/trpc';
import { prisma as _db } from '@/lib/prisma';

type Db = typeof _db;

async function assertSeanceOwner(prisma: Db, seanceId: string, userId: string) {
  const seance = await prisma.seance.findFirst({
    where: { id: seanceId, sequence: { matiere: { classeur: { userId } } } },
  });
  if (!seance) throw new TRPCError({ code: 'NOT_FOUND' });
  return seance;
}

export const seanceRouter = createTRPCRouter({
  list: protectedProcedure
    .input(z.object({ sequenceId: z.string() }))
    .query(async ({ ctx, input }) => {
      const seq = await ctx.prisma.sequence.findFirst({
        where: { id: input.sequenceId, matiere: { classeur: { userId: ctx.session.user.id } } },
      });
      if (!seq) throw new TRPCError({ code: 'NOT_FOUND' });

      return ctx.prisma.seance.findMany({
        where: { sequenceId: input.sequenceId },
        orderBy: { ordre: 'asc' },
        include: {
          _count: { select: { fiches: true } },
          fiches: { include: { items: { select: { duree: true } } } },
        },
      });
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const seance = await ctx.prisma.seance.findFirst({
        where: { id: input.id, sequence: { matiere: { classeur: { userId: ctx.session.user.id } } } },
        include: {
          fiches: {
            orderBy: { ordre: 'asc' },
            include: { items: { orderBy: { ordre: 'asc' } } },
          },
        },
      });
      if (!seance) throw new TRPCError({ code: 'NOT_FOUND' });
      return seance;
    }),

  create: protectedProcedure
    .input(
      z.object({
        titre: z.string().min(1),
        sequenceId: z.string(),
        date: z.string().datetime().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const seq = await ctx.prisma.sequence.findFirst({
        where: { id: input.sequenceId, matiere: { classeur: { userId: ctx.session.user.id } } },
      });
      if (!seq) throw new TRPCError({ code: 'NOT_FOUND' });

      const count = await ctx.prisma.seance.count({ where: { sequenceId: input.sequenceId } });
      return ctx.prisma.seance.create({
        data: { ...input, date: input.date ? new Date(input.date) : undefined, ordre: count + 1 },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        titre: z.string().min(1).optional(),
        date: z.string().datetime().nullable().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, date, ...data } = input;
      await assertSeanceOwner(ctx.prisma, id, ctx.session.user.id);
      return ctx.prisma.seance.update({
        where: { id },
        data: { ...data, ...(date !== undefined ? { date: date ? new Date(date) : null } : {}) },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await assertSeanceOwner(ctx.prisma, input.id, ctx.session.user.id);
      return ctx.prisma.seance.delete({ where: { id: input.id } });
    }),

  reorder: protectedProcedure
    .input(z.object({ ids: z.array(z.string()) }))
    .mutation(async ({ ctx, input }) => {
      await Promise.all(
        input.ids.map((id, ordre) =>
          ctx.prisma.seance.updateMany({
            where: { id, sequence: { matiere: { classeur: { userId: ctx.session.user.id } } } },
            data: { ordre: ordre + 1 },
          }),
        ),
      );
    }),
});
