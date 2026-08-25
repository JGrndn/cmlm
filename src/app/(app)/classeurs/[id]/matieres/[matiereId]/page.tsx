import { auth } from '@/lib/auth/auth';
import { redirect, notFound } from 'next/navigation';
import { classeurSvc, matiereSvc, sequenceSvc, referenceSvc } from '@/server/services';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { MatiereGrid } from '@/components/matieres/MatiereGrid';
import { SequenceList } from '@/components/sequences/SequenceList';

export default async function MatierePage({
  params,
}: {
  params: Promise<{ id: string; matiereId: string }>;
}) {
  const session = await auth();
  if (!session) redirect('/signin');

  const { id, matiereId } = await params;
  const userId = session.user!.id!;

  const [classeur, matiere] = await Promise.all([
    classeurSvc.getById(id, userId).catch(() => null),
    matiereSvc.getById(matiereId, userId).catch(() => null),
  ]);

  if (!classeur || !matiere) notFound();

  const [sequences, periodes, allDomaines] = await Promise.all([
    sequenceSvc.list(matiereId, userId),
    referenceSvc.listPeriodes(classeur.anneeScolaireId),
    matiere.disciplineId
      ? referenceSvc.listDomainesForMatiere(matiere.disciplineId, matiereId)
      : Promise.resolve([]),
  ]);

  return (
    <main className="p-6">
      <Breadcrumb
        items={[
          { label: 'Mes classeurs', href: '/classeurs' },
          { label: classeur.titre, href: `/classeurs/${id}` },
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
          anneeScolaireId={classeur.anneeScolaireId}
          domaines={allDomaines}
          initialSequences={sequences}
          initialPeriodes={periodes}
          initialPeriodesVisibles={matiere.periodesVisibles}
          initialDomaineIdsVisibles={matiere.domaineIdsVisibles}
        />
      ) : (
        <SequenceList
          classeurId={id}
          matiereId={matiereId}
          initialSequences={sequences}
          anneeScolaireId={classeur.anneeScolaireId}
        />
      )}
    </main>
  );
}
