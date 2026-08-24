import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createTRPCRouter, protectedProcedure } from '@/server/trpc';

export const referenceRouter = createTRPCRouter({
  listNiveaux: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.niveauScolaire.findMany({
      orderBy: { ordre: 'asc' },
      include: { cycle: true },
    });
  }),

  listAnnees: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.anneeScolaire.findMany({ orderBy: { debut: 'asc' } });
  }),

  listPeriodes: protectedProcedure
    .input(z.object({ anneeScolaireId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.periode.findMany({
        where: { anneeScolaireId: input.anneeScolaireId },
        orderBy: { dateDebut: 'asc' },
      });
    }),

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
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.$transaction(async (tx) => {
        const annee = await tx.anneeScolaire.create({
          data: { label: input.label, debut: input.debut, fin: input.fin },
        });
        await tx.periode.createMany({
          data: input.periodes.map((p) => ({
            label: p.label,
            dateDebut: new Date(p.dateDebut),
            dateFin: new Date(p.dateFin),
            anneeScolaireId: annee.id,
          })),
        });
        return annee;
      });
    }),

  listDisciplines: protectedProcedure
    .input(z.object({ cycleId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.discipline.findMany({
        where: { cycleId: input.cycleId },
        include: { domaines: { include: { sousDomaines: true } } },
        orderBy: { label: 'asc' },
      });
    }),

  createDomaine: protectedProcedure
    .input(z.object({ disciplineId: z.string(), label: z.string().min(1), matiereId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.domaine.create({
        data: { disciplineId: input.disciplineId, label: input.label, matiereId: input.matiereId },
      });
    }),

  deleteDomaine: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const d = await ctx.prisma.domaine.findFirst({
        where: {
          id: input.id,
          matiereId: { not: null },
          matiere: { classeur: { userId: ctx.session.user.id } },
        },
      });
      if (!d) throw new TRPCError({ code: 'NOT_FOUND' });
      return ctx.prisma.domaine.delete({ where: { id: input.id } });
    }),

  listSousDomaines: protectedProcedure
    .input(z.object({ domaineId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.sousDomaine.findMany({
        where: {
          domaineId: input.domaineId,
          OR: [
            { matiereId: null },
            { matiere: { classeur: { userId: ctx.session.user.id } } },
          ],
        },
        orderBy: { label: 'asc' },
      });
    }),

  createSousDomaine: protectedProcedure
    .input(z.object({ domaineId: z.string(), label: z.string().min(1), matiereId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.sousDomaine.create({
        data: { domaineId: input.domaineId, label: input.label, matiereId: input.matiereId },
      });
    }),

  listObjectifs: protectedProcedure
    .input(z.object({ sousDomainIds: z.array(z.string()) }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.objectif.findMany({
        where: { sousDomainId: { in: input.sousDomainIds } },
        orderBy: { label: 'asc' },
        select: { id: true, label: true, sousDomainId: true },
      });
    }),

  deleteSousDomaine: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const sd = await ctx.prisma.sousDomaine.findFirst({
        where: {
          id: input.id,
          matiereId: { not: null },
          matiere: { classeur: { userId: ctx.session.user.id } },
        },
      });
      if (!sd) throw new TRPCError({ code: 'NOT_FOUND' });
      return ctx.prisma.sousDomaine.delete({ where: { id: input.id } });
    }),
});
