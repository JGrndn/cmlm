import { auth } from '@/lib/auth/auth';
import { redirect, notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
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
      sousDomaine: { include: { domaine: true } },
      sequences: {
        orderBy: { ordre: 'asc' },
        include: { _count: { select: { seances: true } } },
      },
    },
  });

  if (!matiere) notFound();

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <Breadcrumb
        items={[
          { label: 'Mes classeurs', href: '/classeurs' },
          { label: matiere.classeur.titre, href: `/classeurs/${id}` },
          { label: matiere.titre },
        ]}
      />

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{matiere.titre}</h1>
        {matiere.sousDomaine && (
          <p className="text-sm text-gray-500 mt-1">
            {matiere.sousDomaine.domaine.label} › {matiere.sousDomaine.label}
          </p>
        )}
      </div>

      <SequenceList
        classeurId={id}
        matiereId={matiereId}
        initialSequences={matiere.sequences as unknown as RouterOutputs['sequence']['list']}
      />
    </main>
  );
}
