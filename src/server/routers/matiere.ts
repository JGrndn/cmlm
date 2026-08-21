import { z } from 'zod';
import { createTRPCRouter, protectedProcedure, mapDomainError } from '@/server/trpc';
import { matiereService } from '@/server/services';

export const matiereRouter = createTRPCRouter({
  list: protectedProcedure
    .input(z.object({ classeurId: z.string() }))
    .query(({ ctx, input }) =>
      matiereService(ctx.prisma).list(input.classeurId, ctx.session.user.id).catch(mapDomainError),
    ),

  create: protectedProcedure
    .input(
      z.object({
        titre: z.string().min(1),
        classeurId: z.string(),
        sousDomainId: z.string().optional(),
      }),
    )
    .mutation(({ ctx, input }) =>
      matiereService(ctx.prisma).create(input, ctx.session.user.id).catch(mapDomainError),
    ),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        titre: z.string().min(1).optional(),
        sousDomainId: z.string().nullable().optional(),
      }),
    )
    .mutation(({ ctx, input }) => {
      const { id, ...data } = input;
      return matiereService(ctx.prisma).update(id, data, ctx.session.user.id).catch(mapDomainError);
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) =>
      matiereService(ctx.prisma).delete(input.id, ctx.session.user.id).catch(mapDomainError),
    ),

  reorder: protectedProcedure
    .input(z.object({ ids: z.array(z.string()) }))
    .mutation(({ ctx, input }) =>
      matiereService(ctx.prisma).reorder(input.ids, ctx.session.user.id).catch(mapDomainError),
    ),
});
