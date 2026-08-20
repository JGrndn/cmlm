import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '@/server/trpc';

export const ficheRouter = createTRPCRouter({
  list: publicProcedure.query(async ({ ctx }) => {
    return ctx.prisma.fiche.findMany({ orderBy: { createdAt: 'desc' } });
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.fiche.findUnique({
        where: { id: input.id },
        include: { items: { orderBy: { ordre: 'asc' } } },
      });
    }),

  create: publicProcedure
    .input(z.object({ titre: z.string().min(1), userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.fiche.create({ data: input });
    }),

  update: publicProcedure
    .input(z.object({ id: z.string(), titre: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.prisma.fiche.update({ where: { id }, data });
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.fiche.delete({ where: { id: input.id } });
    }),
});
