import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { FichesGlobalesClient } from '@/components/fiches/FichesGlobalesClient';

export default async function FichesPage() {
  const session = await auth();
  if (!session) redirect('/signin');

  const userId = session.user!.id!;

  const classeurs = await prisma.classeur.findMany({
    where: { userId },
    select: { id: true, titre: true },
    orderBy: { createdAt: 'asc' },
  });

  const fichesByClasseur = await Promise.all(
    classeurs.map(async (classeur) => {
      const fiches = await prisma.fiche.findMany({
        where: { classeurId: classeur.id, sequenceId: null },
        include: {
          phases: { orderBy: { ordre: 'asc' } },
          disciplines: { select: { id: true } },
          domaines: { select: { id: true } },
          sousDomaines: { select: { id: true } },
        },
        orderBy: { ordre: 'asc' },
      });
      return {
        classeur,
        fiches: fiches.map((f) => ({
          id: f.id,
          titre: f.titre,
          sequenceId: f.sequenceId,
          classeurId: f.classeurId,
          ordre: f.ordre,
          objectifs: f.objectifs,
          materiels: f.materiels,
          disciplineIds: f.disciplines.map((d) => d.id),
          domaineIds: f.domaines.map((d) => d.id),
          sousDomainIds: f.sousDomaines.map((d) => d.id),
          phases: f.phases.map((p) => ({
            id: p.id,
            titre: p.titre,
            duree: p.duree,
            description: p.description,
          })),
        })),
      };
    }),
  );

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mes fiches</h1>
      </div>
      <FichesGlobalesClient classeurs={classeurs} fichesByClasseur={fichesByClasseur} />
    </main>
  );
}
