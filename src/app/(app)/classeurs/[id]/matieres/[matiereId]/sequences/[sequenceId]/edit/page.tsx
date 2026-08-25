import { auth } from '@/lib/auth/auth';
import { redirect, notFound } from 'next/navigation';
import { classeurSvc, matiereSvc, sequenceSvc, referenceSvc } from '@/server/services';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { SequenceEditor } from '@/components/sequences/SequenceEditor';
import { SequenceSidebar } from '@/components/sequences/SequenceSidebar';

export default async function SequenceEditPage({
  params,
}: {
  params: Promise<{ id: string; matiereId: string; sequenceId: string }>;
}) {
  const session = await auth();
  if (!session) redirect('/signin');

  const { id, matiereId, sequenceId } = await params;
  const userId = session.user!.id!;

  const [classeur, matiere] = await Promise.all([
    classeurSvc.getById(id, userId).catch(() => null),
    matiereSvc.getById(matiereId, userId).catch(() => null),
  ]);

  if (!classeur || !matiere) notFound();

  const cycleId = classeur.niveau.cycle.id;

  const [sequence, referenceTree] = await Promise.all([
    sequenceSvc.getById(sequenceId, userId).catch(() => null),
    referenceSvc.getSequenceReferenceTree(cycleId, matiereId),
  ]);

  if (!sequence) notFound();

  const initialData = {
    id: sequence.id,
    titre: sequence.titre,
    niveauIds: sequence.niveauIds,
    periodeId: sequence.periodeId,
    objectifs: sequence.objectifs,
    disciplineIds: sequence.disciplineIds,
    domaineIds: sequence.domaineIds,
    sousDomainIds: sequence.sousDomainIds,
    objectifIds: sequence.objectifIds,
    fiches: sequence.fiches,
    matiere: {
      classeur: {
        niveauId: classeur.niveauId,
        anneeScolaireId: classeur.anneeScolaireId,
      },
      disciplineId: matiere.disciplineId,
    },
  };

  return (
    <main className="w-full">
      <Breadcrumb
        items={[
          { label: 'Mes classeurs', href: '/classeurs' },
          { label: classeur.titre, href: `/classeurs/${id}` },
          { label: matiere.titre, href: `/classeurs/${id}/matieres/${matiereId}` },
          { label: sequence.titre, href: `/classeurs/${id}/matieres/${matiereId}/sequences/${sequenceId}` },
          { label: 'Modifier' },
        ]}
      />

      <div id="sequence-top" className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Modifier la séquence</h1>
      </div>

      <div className="flex gap-4 items-start">
        <SequenceSidebar
          sequenceId={sequenceId}
          sequenceTitre={sequence.titre}
          initialFiches={sequence.fiches.map((f) => ({
            id: f.id,
            titre: f.titre,
            phases: f.phases.map((p) => ({ id: p.id, titre: p.titre })),
          }))}
        />

        <div className="flex-1 min-w-0">
          <SequenceEditor
            sequenceId={sequenceId}
            classeurId={id}
            matiereId={matiereId}
            initialData={initialData}
            referenceTree={referenceTree}
          />
        </div>
      </div>
    </main>
  );
}
