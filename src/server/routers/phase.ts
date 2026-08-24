import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { Prisma } from '@/generated/prisma';
import { createTRPCRouter, protectedProcedure } from '@/server/trpc';
import { prisma as _db } from '@/lib/prisma';

type Db = typeof _db;

const EMPTY_DOC = { type: 'doc', content: [{ type: 'paragraph' }] };

async function assertPhaseOwner(prisma: Db, phaseId: string, userId: string) {
  const phase = await prisma.phase.findFirst({
    where: {
      id: phaseId,
      fiche: { sequence: { matiere: { classeur: { userId } } } },
    },
  });
  if (!phase) throw new TRPCError({ code: 'NOT_FOUND' });
  return phase;
}

export const phaseRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        ficheId: z.string(),
        titre: z.string().optional(),
        description: z.record(z.string(), z.unknown()).optional(),
        duree: z.number().int().min(1).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const fiche = await ctx.prisma.fiche.findFirst({
        where: {
          id: input.ficheId,
          sequence: { matiere: { classeur: { userId: ctx.session.user.id } } },
        },
      });
      if (!fiche) throw new TRPCError({ code: 'NOT_FOUND' });

      const count = await ctx.prisma.phase.count({ where: { ficheId: input.ficheId } });
      return ctx.prisma.phase.create({
        data: {
          ficheId: input.ficheId,
          titre: input.titre ?? '',
          description: (input.description ?? EMPTY_DOC) as Prisma.InputJsonValue,
          ordre: count + 1,
          ...(input.duree !== undefined ? { duree: input.duree } : {}),
        },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        titre: z.string().optional(),
        description: z.record(z.string(), z.unknown()).optional(),
        duree: z.number().int().min(1).nullable().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, description, ...rest } = input;
      await assertPhaseOwner(ctx.prisma, id, ctx.session.user.id);
      return ctx.prisma.phase.update({
        where: { id },
        data: {
          ...rest,
          ...(description !== undefined ? { description: description as Prisma.InputJsonValue } : {}),
        },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await assertPhaseOwner(ctx.prisma, input.id, ctx.session.user.id);
      return ctx.prisma.phase.delete({ where: { id: input.id } });
    }),

  reorder: protectedProcedure
    .input(z.object({ ids: z.array(z.string()) }))
    .mutation(async ({ ctx, input }) => {
      await Promise.all(
        input.ids.map((id, ordre) =>
          ctx.prisma.phase.updateMany({
            where: {
              id,
              fiche: { sequence: { matiere: { classeur: { userId: ctx.session.user.id } } } },
            },
            data: { ordre: ordre + 1 },
          }),
        ),
      );
    }),
});
