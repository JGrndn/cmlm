import { z } from 'zod';
import { createTRPCRouter, protectedProcedure, mapDomainError } from '@/server/trpc';
import { referenceService } from '@/server/services';

export const referenceRouter = createTRPCRouter({
  listNiveaux: protectedProcedure.query(({ ctx }) =>
    referenceService(ctx.prisma).listNiveaux(),
  ),

  listAnnees: protectedProcedure.query(({ ctx }) =>
    referenceService(ctx.prisma).listAnneesScolaires(),
  ),

  listPeriodes: protectedProcedure
    .input(z.object({ anneeScolaireId: z.string() }))
    .query(({ ctx, input }) =>
      referenceService(ctx.prisma).listPeriodes(input.anneeScolaireId),
    ),

  createAnneeScolaire: protectedProcedure
    .input(
      z.object({
        label: z.string().min(1),
        debut: z.number().int(),
        fin: z.number().int(),
        periodes: z
          .array(
            z.object({
              label: z.string().min(1),
              dateDebut: z.string(),
              dateFin: z.string(),
            }),
          )
          .min(1),
      }),
    )
    .mutation(({ ctx, input }) =>
      referenceService(ctx.prisma).createAnneeScolaire(input),
    ),

  listDisciplines: protectedProcedure
    .input(z.object({ cycleId: z.string() }))
    .query(({ ctx, input }) =>
      referenceService(ctx.prisma).listDisciplines(input.cycleId),
    ),

  createDomaine: protectedProcedure
    .input(z.object({ disciplineId: z.string(), label: z.string().min(1), matiereId: z.string() }))
    .mutation(({ ctx, input }) =>
      referenceService(ctx.prisma).createDomaine(input),
    ),

  deleteDomaine: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) =>
      referenceService(ctx.prisma).deleteDomaine(input.id, ctx.session.user.id).catch(mapDomainError),
    ),

  listSousDomaines: protectedProcedure
    .input(z.object({ domaineId: z.string() }))
    .query(({ ctx, input }) =>
      referenceService(ctx.prisma).listSousDomaines(input.domaineId, ctx.session.user.id),
    ),

  createSousDomaine: protectedProcedure
    .input(z.object({ domaineId: z.string(), label: z.string().min(1), matiereId: z.string() }))
    .mutation(({ ctx, input }) =>
      referenceService(ctx.prisma).createSousDomaine(input),
    ),

  listObjectifs: protectedProcedure
    .input(z.object({ sousDomainIds: z.array(z.string()) }))
    .query(({ ctx, input }) =>
      referenceService(ctx.prisma).listObjectifs(input.sousDomainIds),
    ),

  deleteSousDomaine: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) =>
      referenceService(ctx.prisma).deleteSousDomaine(input.id, ctx.session.user.id).catch(mapDomainError),
    ),
});
