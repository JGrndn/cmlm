import { auth } from '@/lib/auth/auth';
import { redirect, notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { FicheEditor } from '@/components/fiches/FicheEditor';
import type { Fiche } from '@/components/fiches/FicheEditor';

export default async function SeancePage({
  params,
}: {
  params: Promise<{ id: string; matiereId: string; sequenceId: string; seanceId: string }>;
}) {
  const session = await auth();
  if (!session) redirect('/signin');

  const { id, matiereId, sequenceId, seanceId } = await params;

  const seance = await prisma.seance.findFirst({
    where: {
      id: seanceId,
      sequence: { id: sequenceId, matiere: { id: matiereId, classeur: { id, userId: session.user!.id! } } },
    },
    include: {
      sequence: {
        include: {
          matiere: { include: { classeur: true } },
        },
      },
      fiches: {
        orderBy: { ordre: 'asc' },
        include: { items: { orderBy: { ordre: 'asc' } } },
      },
    },
  });

  if (!seance) notFound();

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <Breadcrumb
        items={[
          { label: 'Mes classeurs', href: '/classeurs' },
          { label: seance.sequence.matiere.classeur.titre, href: `/classeurs/${id}` },
          { label: seance.sequence.matiere.titre, href: `/classeurs/${id}/matieres/${matiereId}` },
          { label: seance.sequence.titre, href: `/classeurs/${id}/matieres/${matiereId}/sequences/${sequenceId}` },
          { label: seance.titre },
        ]}
      />

      <FicheEditor
        seanceId={seanceId}
        seanceTitre={seance.titre}
        initialFiches={seance.fiches as unknown as Fiche[]}
        classeurId={id}
        matiereId={matiereId}
        sequenceId={sequenceId}
      />
    </main>
  );
}
