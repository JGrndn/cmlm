import { z } from 'zod';
import { createTRPCRouter, protectedProcedure, mapDomainError } from '@/server/trpc';
import { ficheService } from '@/server/services';

const idsArray = z.array(z.string()).optional();

export const ficheRouter = createTRPCRouter({
  list: protectedProcedure
    .input(z.object({ sequenceId: z.string() }))
    .query(({ ctx, input }) =>
      ficheService(ctx.prisma).list(input.sequenceId, ctx.session.user.id).catch(mapDomainError),
    ),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) =>
      ficheService(ctx.prisma).getById(input.id, ctx.session.user.id).catch(mapDomainError),
    ),

  create: protectedProcedure
    .input(z.object({ titre: z.string().min(1), sequenceId: z.string() }))
    .mutation(({ ctx, input }) =>
      ficheService(ctx.prisma).create(input, ctx.session.user.id).catch(mapDomainError),
    ),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        titre: z.string().min(1).optional(),
        objectifs: z.string().nullable().optional(),
        materiels: z.array(z.string()).optional(),
        disciplineIds: idsArray,
        domaineIds: idsArray,
        sousDomainIds: idsArray,
      }),
    )
    .mutation(({ ctx, input }) => {
      const { id, ...data } = input;
      return ficheService(ctx.prisma).update(id, data, ctx.session.user.id).catch(mapDomainError);
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) =>
      ficheService(ctx.prisma).delete(input.id, ctx.session.user.id).catch(mapDomainError),
    ),

  reorder: protectedProcedure
    .input(z.object({ ids: z.array(z.string()) }))
    .mutation(({ ctx, input }) =>
      ficheService(ctx.prisma).reorder(input.ids, ctx.session.user.id).catch(mapDomainError),
    ),
});
