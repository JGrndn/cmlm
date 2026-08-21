import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { Prisma } from '@/generated/prisma';
import { createTRPCRouter, protectedProcedure } from '@/server/trpc';
import { prisma as _db } from '@/lib/prisma';

type Db = typeof _db;

async function assertItemOwner(prisma: Db, itemId: string, userId: string) {
  const item = await prisma.item.findFirst({
    where: {
      id: itemId,
      fiche: { seance: { sequence: { matiere: { classeur: { userId } } } } },
    },
  });
  if (!item) throw new TRPCError({ code: 'NOT_FOUND' });
  return item;
}

export const itemRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        ficheId: z.string(),
        contenu: z.record(z.string(), z.unknown()),
        duree: z.number().int().min(1).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const fiche = await ctx.prisma.fiche.findFirst({
        where: {
          id: input.ficheId,
          seance: { sequence: { matiere: { classeur: { userId: ctx.session.user.id } } } },
        },
      });
      if (!fiche) throw new TRPCError({ code: 'NOT_FOUND' });

      const count = await ctx.prisma.item.count({ where: { ficheId: input.ficheId } });
      return ctx.prisma.item.create({
        data: {
          ficheId: input.ficheId,
          contenu: input.contenu as Prisma.InputJsonValue,
          ordre: count + 1,
          ...(input.duree !== undefined ? { duree: input.duree } : {}),
        },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        contenu: z.record(z.string(), z.unknown()).optional(),
        duree: z.number().int().min(1).nullable().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, contenu, ...rest } = input;
      await assertItemOwner(ctx.prisma, id, ctx.session.user.id);
      return ctx.prisma.item.update({
        where: { id },
        data: {
          ...rest,
          ...(contenu !== undefined ? { contenu: contenu as Prisma.InputJsonValue } : {}),
        },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await assertItemOwner(ctx.prisma, input.id, ctx.session.user.id);
      return ctx.prisma.item.delete({ where: { id: input.id } });
    }),

  reorder: protectedProcedure
    .input(z.object({ ids: z.array(z.string()) }))
    .mutation(async ({ ctx, input }) => {
      await Promise.all(
        input.ids.map((id, ordre) =>
          ctx.prisma.item.updateMany({
            where: {
              id,
              fiche: { seance: { sequence: { matiere: { classeur: { userId: ctx.session.user.id } } } } },
            },
            data: { ordre: ordre + 1 },
          }),
        ),
      );
    }),
});
