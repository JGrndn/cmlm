import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '@/server/trpc';

export const itemRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        ficheId: z.string(),
        ordre: z.number().int().min(0),
        contenu: z.unknown(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.item.create({ data: input as any });
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        ordre: z.number().int().min(0).optional(),
        contenu: z.unknown().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.prisma.item.update({ where: { id }, data: data as any });
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.item.delete({ where: { id: input.id } });
    }),
});
