import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createTRPCRouter, protectedProcedure } from '@/server/trpc';
import { Periode } from '@/generated/prisma';
import { prisma as _db } from '@/lib/prisma';

type Db = typeof _db;

async function assertSequenceOwner(prisma: Db, sequenceId: string, userId: string) {
  const seq = await prisma.sequence.findFirst({
    where: { id: sequenceId, matiere: { classeur: { userId } } },
  });
  if (!seq) throw new TRPCError({ code: 'NOT_FOUND' });
  return seq;
}

export const sequenceRouter = createTRPCRouter({
  list: protectedProcedure
    .input(z.object({ matiereId: z.string() }))
    .query(async ({ ctx, input }) => {
      const matiere = await ctx.prisma.matiere.findFirst({
        where: { id: input.matiereId, classeur: { userId: ctx.session.user.id } },
      });
      if (!matiere) throw new TRPCError({ code: 'NOT_FOUND' });

      return ctx.prisma.sequence.findMany({
        where: { matiereId: input.matiereId },
        orderBy: { ordre: 'asc' },
        include: { _count: { select: { seances: true } } },
      });
    }),

  create: protectedProcedure
    .input(
      z.object({
        titre: z.string().min(1),
        matiereId: z.string(),
        periode: z.nativeEnum(Periode).optional(),
        objectifs: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const matiere = await ctx.prisma.matiere.findFirst({
        where: { id: input.matiereId, classeur: { userId: ctx.session.user.id } },
      });
      if (!matiere) throw new TRPCError({ code: 'NOT_FOUND' });

      const count = await ctx.prisma.sequence.count({ where: { matiereId: input.matiereId } });
      return ctx.prisma.sequence.create({ data: { ...input, ordre: count + 1 } });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        titre: z.string().min(1).optional(),
        periode: z.nativeEnum(Periode).nullable().optional(),
        objectifs: z.string().nullable().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      await assertSequenceOwner(ctx.prisma, id, ctx.session.user.id);
      return ctx.prisma.sequence.update({ where: { id }, data });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await assertSequenceOwner(ctx.prisma, input.id, ctx.session.user.id);
      return ctx.prisma.sequence.delete({ where: { id: input.id } });
    }),

  reorder: protectedProcedure
    .input(z.object({ ids: z.array(z.string()) }))
    .mutation(async ({ ctx, input }) => {
      await Promise.all(
        input.ids.map((id, ordre) =>
          ctx.prisma.sequence.updateMany({
            where: { id, matiere: { classeur: { userId: ctx.session.user.id } } },
            data: { ordre: ordre + 1 },
          }),
        ),
      );
    }),
});
