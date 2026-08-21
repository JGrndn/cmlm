import { z } from 'zod';
import { Periode } from '@/generated/prisma';
import { createTRPCRouter, protectedProcedure, mapDomainError } from '@/server/trpc';
import { sequenceService } from '@/server/services';

export const sequenceRouter = createTRPCRouter({
  list: protectedProcedure
    .input(z.object({ matiereId: z.string() }))
    .query(({ ctx, input }) =>
      sequenceService(ctx.prisma).list(input.matiereId, ctx.session.user.id).catch(mapDomainError),
    ),

  create: protectedProcedure
    .input(
      z.object({
        titre: z.string().min(1),
        matiereId: z.string(),
        periode: z.nativeEnum(Periode).optional(),
        objectifs: z.string().optional(),
      }),
    )
    .mutation(({ ctx, input }) =>
      sequenceService(ctx.prisma).create(input, ctx.session.user.id).catch(mapDomainError),
    ),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        titre: z.string().min(1).optional(),
        periode: z.nativeEnum(Periode).nullable().optional(),
        objectifs: z.string().nullable().optional(),
      }),
    )
    .mutation(({ ctx, input }) => {
      const { id, ...data } = input;
      return sequenceService(ctx.prisma).update(id, data, ctx.session.user.id).catch(mapDomainError);
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) =>
      sequenceService(ctx.prisma).delete(input.id, ctx.session.user.id).catch(mapDomainError),
    ),

  reorder: protectedProcedure
    .input(z.object({ ids: z.array(z.string()) }))
    .mutation(({ ctx, input }) =>
      sequenceService(ctx.prisma).reorder(input.ids, ctx.session.user.id).catch(mapDomainError),
    ),
});
