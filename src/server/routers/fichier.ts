import { z } from 'zod';
import { createTRPCRouter, protectedProcedure, mapDomainError } from '@/server/trpc';
import { fichierService } from '@/server/services';

export const fichierRouter = createTRPCRouter({
  list: protectedProcedure
    .input(z.object({ ficheId: z.string() }))
    .query(({ ctx, input }) =>
      fichierService(ctx.prisma).list(input.ficheId, ctx.session.user.id).catch(mapDomainError),
    ),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) =>
      fichierService(ctx.prisma).delete(input.id, ctx.session.user.id).catch(mapDomainError),
    ),
});
