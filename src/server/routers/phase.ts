import { z } from 'zod';
import { createTRPCRouter, protectedProcedure, mapDomainError } from '@/server/trpc';
import { phaseService } from '@/server/services';

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
    .mutation(({ ctx, input }) =>
      phaseService(ctx.prisma).create(input, ctx.session.user.id).catch(mapDomainError),
    ),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        titre: z.string().optional(),
        description: z.record(z.string(), z.unknown()).optional(),
        duree: z.number().int().min(1).nullable().optional(),
      }),
    )
    .mutation(({ ctx, input }) => {
      const { id, ...rest } = input;
      return phaseService(ctx.prisma).update(id, rest, ctx.session.user.id).catch(mapDomainError);
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) =>
      phaseService(ctx.prisma).delete(input.id, ctx.session.user.id).catch(mapDomainError),
    ),

  reorder: protectedProcedure
    .input(z.object({ ids: z.array(z.string()) }))
    .mutation(({ ctx, input }) =>
      phaseService(ctx.prisma).reorder(input.ids, ctx.session.user.id).catch(mapDomainError),
    ),
});
