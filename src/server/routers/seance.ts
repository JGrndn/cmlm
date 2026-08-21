import { z } from 'zod';
import { createTRPCRouter, protectedProcedure, mapDomainError } from '@/server/trpc';
import { seanceService } from '@/server/services';

export const seanceRouter = createTRPCRouter({
  list: protectedProcedure
    .input(z.object({ sequenceId: z.string() }))
    .query(({ ctx, input }) =>
      seanceService(ctx.prisma).list(input.sequenceId, ctx.session.user.id).catch(mapDomainError),
    ),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) =>
      seanceService(ctx.prisma).getById(input.id, ctx.session.user.id).catch(mapDomainError),
    ),

  create: protectedProcedure
    .input(
      z.object({
        titre: z.string().min(1),
        sequenceId: z.string(),
        date: z.string().datetime().optional(),
      }),
    )
    .mutation(({ ctx, input }) =>
      seanceService(ctx.prisma).create(input, ctx.session.user.id).catch(mapDomainError),
    ),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        titre: z.string().min(1).optional(),
        date: z.string().datetime().nullable().optional(),
      }),
    )
    .mutation(({ ctx, input }) => {
      const { id, ...data } = input;
      return seanceService(ctx.prisma).update(id, data, ctx.session.user.id).catch(mapDomainError);
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) =>
      seanceService(ctx.prisma).delete(input.id, ctx.session.user.id).catch(mapDomainError),
    ),

  reorder: protectedProcedure
    .input(z.object({ ids: z.array(z.string()) }))
    .mutation(({ ctx, input }) =>
      seanceService(ctx.prisma).reorder(input.ids, ctx.session.user.id).catch(mapDomainError),
    ),
});
