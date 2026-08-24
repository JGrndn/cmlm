import { auth } from '@/lib/auth/auth';
import { redirect, notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { MatiereGrid } from '@/components/matieres/MatiereGrid';
import { SequenceList } from '@/components/sequences/SequenceList';
import type { RouterOutputs } from '@/lib/trpc/types';

export default async function MatierePage({
  params,
}: {
  params: Promise<{ id: string; matiereId: string }>;
}) {
  const session = await auth();
  if (!session) redirect('/signin');

  const { id, matiereId } = await params;

  const matiere = await prisma.matiere.findFirst({
    where: { id: matiereId, classeur: { id, userId: session.user!.id! } },
    include: {
      classeur: { include: { anneeScolaire: true, niveau: true } },
      discipline: {
        include: {
          domaines: {
            where: { matiereId: null },
            orderBy: { label: 'asc' },
          },
        },
      },
      domaines: { orderBy: { label: 'asc' } },
      sequences: {
        orderBy: { ordre: 'asc' },
        include: {
          _count: { select: { fiches: true } },
          periode: { select: { id: true, label: true } },
          disciplines: { select: { id: true } },
          domaines: { select: { id: true } },
          sousDomaines: { select: { id: true } },
        },
      },
    },
  });

  if (!matiere) notFound();

  const periodes = await prisma.periode.findMany({
    where: { anneeScolaireId: matiere.classeur.anneeScolaireId },
    orderBy: { dateDebut: 'asc' },
  });

  const initialSequences = matiere.sequences.map((s) => ({
    id: s.id,
    titre: s.titre,
    ordre: s.ordre,
    matiereId: s.matiereId,
    periodeId: s.periodeId,
    periodeLabel: s.periode?.label ?? null,
    objectifs: s.objectifs,
    niveauId: (s as unknown as { niveauId: string | null }).niveauId ?? null,
    disciplineIds: s.disciplines.map((d) => d.id),
    domaineIds: s.domaines.map((d) => d.id),
    sousDomainIds: s.sousDomaines.map((d) => d.id),
    _count: { fiches: s._count.fiches },
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
  })) as unknown as RouterOutputs['sequence']['list'];

  const allDomaines = [
    ...(matiere.discipline?.domaines ?? []),
    ...matiere.domaines,
  ];

  return (
    <main className="p-6">
      <Breadcrumb
        items={[
          { label: 'Mes classeurs', href: '/classeurs' },
          { label: matiere.classeur.titre, href: `/classeurs/${id}` },
          { label: matiere.titre },
        ]}
      />

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{matiere.titre}</h1>
        {matiere.discipline && (
          <p className="text-sm text-gray-500 mt-1">{matiere.discipline.label}</p>
        )}
      </div>

      {matiere.discipline && allDomaines.length > 0 ? (
        <MatiereGrid
          classeurId={id}
          matiereId={matiereId}
          disciplineId={matiere.disciplineId!}
          anneeScolaireId={matiere.classeur.anneeScolaireId}
          domaines={allDomaines}
          initialSequences={initialSequences}
          initialPeriodes={periodes}
          initialPeriodesVisibles={matiere.periodesVisibles as string[]}
          initialDomaineIdsVisibles={matiere.domaineIdsVisibles}
        />
      ) : (
        <SequenceList
          classeurId={id}
          matiereId={matiereId}
          initialSequences={initialSequences}
          anneeScolaireId={matiere.classeur.anneeScolaireId}
        />
      )}
    </main>
  );
}
