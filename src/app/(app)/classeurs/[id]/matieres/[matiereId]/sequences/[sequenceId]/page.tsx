import { auth } from '@/lib/auth/auth';
import { redirect, notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { SeanceList } from '@/components/seances/SeanceList';
import type { RouterOutputs } from '@/lib/trpc/types';

export default async function SequencePage({
  params,
}: {
  params: Promise<{ id: string; matiereId: string; sequenceId: string }>;
}) {
  const session = await auth();
  if (!session) redirect('/signin');

  const { id, matiereId, sequenceId } = await params;

  const sequence = await prisma.sequence.findFirst({
    where: { id: sequenceId, matiere: { id: matiereId, classeur: { id, userId: session.user!.id! } } },
    include: {
      matiere: {
        include: {
          classeur: true,
        },
      },
      seances: {
        orderBy: { ordre: 'asc' },
        include: {
          _count: { select: { fiches: true } },
          fiches: { include: { items: { select: { duree: true } } } },
        },
      },
    },
  });

  if (!sequence) notFound();

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <Breadcrumb
        items={[
          { label: 'Mes classeurs', href: '/classeurs' },
          { label: sequence.matiere.classeur.titre, href: `/classeurs/${id}` },
          { label: sequence.matiere.titre, href: `/classeurs/${id}/matieres/${matiereId}` },
          { label: sequence.titre },
        ]}
      />

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{sequence.titre}</h1>
        <div className="flex items-center gap-3 mt-1">
          {sequence.periode && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-medium">
              {sequence.periode}
            </span>
          )}
          {sequence.objectifs && (
            <p className="text-sm text-gray-500">{sequence.objectifs}</p>
          )}
        </div>
      </div>

      <SeanceList
        classeurId={id}
        matiereId={matiereId}
        sequenceId={sequenceId}
        initialSeances={sequence.seances as unknown as RouterOutputs['seance']['list']}
      />
    </main>
  );
}
