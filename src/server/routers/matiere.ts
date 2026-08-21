import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createTRPCRouter, protectedProcedure } from '@/server/trpc';
import { prisma as _db } from '@/lib/prisma';

type Db = typeof _db;

async function assertMatiereOwner(prisma: Db, matiereId: string, userId: string) {
  const matiere = await prisma.matiere.findFirst({
    where: { id: matiereId, classeur: { userId } },
  });
  if (!matiere) throw new TRPCError({ code: 'NOT_FOUND' });
  return matiere;
}

export const matiereRouter = createTRPCRouter({
  list: protectedProcedure
    .input(z.object({ classeurId: z.string() }))
    .query(async ({ ctx, input }) => {
      const classeur = await ctx.prisma.classeur.findFirst({
        where: { id: input.classeurId, userId: ctx.session.user.id },
      });
      if (!classeur) throw new TRPCError({ code: 'NOT_FOUND' });

      return ctx.prisma.matiere.findMany({
        where: { classeurId: input.classeurId },
        orderBy: { ordre: 'asc' },
        include: {
          sousDomaine: { include: { domaine: true } },
          _count: { select: { sequences: true } },
        },
      });
    }),

  create: protectedProcedure
    .input(
      z.object({
        titre: z.string().min(1),
        classeurId: z.string(),
        sousDomainId: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const classeur = await ctx.prisma.classeur.findFirst({
        where: { id: input.classeurId, userId: ctx.session.user.id },
      });
      if (!classeur) throw new TRPCError({ code: 'NOT_FOUND' });

      const count = await ctx.prisma.matiere.count({ where: { classeurId: input.classeurId } });
      return ctx.prisma.matiere.create({ data: { ...input, ordre: count + 1 } });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        titre: z.string().min(1).optional(),
        sousDomainId: z.string().nullable().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      await assertMatiereOwner(ctx.prisma, id, ctx.session.user.id);
      return ctx.prisma.matiere.update({ where: { id }, data });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await assertMatiereOwner(ctx.prisma, input.id, ctx.session.user.id);
      return ctx.prisma.matiere.delete({ where: { id: input.id } });
    }),

  reorder: protectedProcedure
    .input(z.object({ ids: z.array(z.string()) }))
    .mutation(async ({ ctx, input }) => {
      await Promise.all(
        input.ids.map((id, ordre) =>
          ctx.prisma.matiere.updateMany({
            where: { id, classeur: { userId: ctx.session.user.id } },
            data: { ordre: ordre + 1 },
          }),
        ),
      );
    }),
});
