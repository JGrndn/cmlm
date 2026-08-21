import { z } from 'zod';
import { createTRPCRouter, protectedProcedure, mapDomainError } from '@/server/trpc';
import { classeurService } from '@/server/services';

export const classeurRouter = createTRPCRouter({
  list: protectedProcedure.query(({ ctx }) =>
    classeurService(ctx.prisma).list(ctx.session.user.id).catch(mapDomainError),
  ),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) =>
      classeurService(ctx.prisma).getById(input.id, ctx.session.user.id).catch(mapDomainError),
    ),

  create: protectedProcedure
    .input(
      z.object({
        titre: z.string().min(1),
        niveauId: z.string(),
        anneeScolaireId: z.string(),
      }),
    )
    .mutation(({ ctx, input }) =>
      classeurService(ctx.prisma).create(input, ctx.session.user.id).catch(mapDomainError),
    ),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        titre: z.string().min(1).optional(),
        niveauId: z.string().optional(),
        anneeScolaireId: z.string().optional(),
      }),
    )
    .mutation(({ ctx, input }) => {
      const { id, ...data } = input;
      return classeurService(ctx.prisma).update(id, data, ctx.session.user.id).catch(mapDomainError);
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) =>
      classeurService(ctx.prisma).delete(input.id, ctx.session.user.id).catch(mapDomainError),
    ),

  duplicate: protectedProcedure
    .input(z.object({ id: z.string(), anneeScolaireId: z.string() }))
    .mutation(({ ctx, input }) =>
      classeurService(ctx.prisma)
        .duplicate(input.id, input.anneeScolaireId, ctx.session.user.id)
        .catch(mapDomainError),
    ),
});
