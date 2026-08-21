import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createTRPCRouter, protectedProcedure } from '@/server/trpc';
import { prisma as _db } from '@/lib/prisma';

type Db = typeof _db;

async function assertClasseurOwner(prisma: Db, classeurId: string, userId: string) {
  const classeur = await prisma.classeur.findFirst({
    where: { id: classeurId, userId },
  });
  if (!classeur) throw new TRPCError({ code: 'NOT_FOUND' });
  return classeur;
}

export const classeurRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.classeur.findMany({
      where: { userId: ctx.session.user.id },
      include: {
        niveau: { include: { cycle: true } },
        anneeScolaire: true,
        _count: {
          select: {
            matieres: true,
          },
        },
      },
      orderBy: [{ anneeScolaire: { debut: 'desc' } }, { createdAt: 'desc' }],
    });
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const classeur = await ctx.prisma.classeur.findFirst({
        where: { id: input.id, userId: ctx.session.user.id },
        include: {
          niveau: { include: { cycle: true } },
          anneeScolaire: true,
          matieres: {
            orderBy: { ordre: 'asc' },
            include: { sousDomaine: { include: { domaine: true } } },
          },
        },
      });
      if (!classeur) throw new TRPCError({ code: 'NOT_FOUND' });
      return classeur;
    }),

  create: protectedProcedure
    .input(
      z.object({
        titre: z.string().min(1),
        niveauId: z.string(),
        anneeScolaireId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.classeur.create({
        data: { ...input, userId: ctx.session.user.id },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        titre: z.string().min(1).optional(),
        niveauId: z.string().optional(),
        anneeScolaireId: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      await assertClasseurOwner(ctx.prisma, id, ctx.session.user.id);
      return ctx.prisma.classeur.update({ where: { id }, data });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await assertClasseurOwner(ctx.prisma, input.id, ctx.session.user.id);
      return ctx.prisma.classeur.delete({ where: { id: input.id } });
    }),

  duplicate: protectedProcedure
    .input(z.object({ id: z.string(), anneeScolaireId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const source = await ctx.prisma.classeur.findFirst({
        where: { id: input.id, userId: ctx.session.user.id },
        include: {
          matieres: {
            include: {
              sequences: {
                include: {
                  seances: {
                    include: {
                      fiches: {
                        include: { items: true },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });
      if (!source) throw new TRPCError({ code: 'NOT_FOUND' });

      return ctx.prisma.classeur.create({
        data: {
          titre: source.titre,
          userId: ctx.session.user.id,
          niveauId: source.niveauId,
          anneeScolaireId: input.anneeScolaireId,
          matieres: {
            create: source.matieres.map((m) => ({
              titre: m.titre,
              ordre: m.ordre,
              sousDomainId: m.sousDomainId,
              sequences: {
                create: m.sequences.map((s) => ({
                  titre: s.titre,
                  ordre: s.ordre,
                  periode: s.periode,
                  objectifs: s.objectifs,
                  seances: {
                    create: s.seances.map((se) => ({
                      titre: se.titre,
                      ordre: se.ordre,
                      date: se.date,
                      fiches: {
                        create: se.fiches.map((f) => ({
                          titre: f.titre,
                          ordre: f.ordre,
                          items: {
                            create: f.items.map((it) => ({
                              ordre: it.ordre,
                              duree: it.duree,
                              contenu: it.contenu as object,
                            })),
                          },
                        })),
                      },
                    })),
                  },
                })),
              },
            })),
          },
        },
      });
    }),
});
