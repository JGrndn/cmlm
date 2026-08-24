import { auth } from '@/lib/auth/auth';
import { redirect, notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
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

  const sequence = await prisma.sequence.findFirst({
    where: { id: sequenceId, matiere: { id: matiereId, classeur: { id, userId: session.user!.id! } } },
    include: {
      matiere: {
        include: {
          classeur: {
            include: { niveau: { include: { cycle: true } } },
          },
        },
      },
      niveaux: { select: { id: true } },
      disciplines: { select: { id: true } },
      domaines: { select: { id: true } },
      sousDomaines: { select: { id: true } },
      objectifsLearning: { select: { id: true } },
      fiches: {
        orderBy: { ordre: 'asc' },
        include: {
          phases: { orderBy: { ordre: 'asc' } },
          disciplines: { select: { id: true } },
          domaines: { select: { id: true } },
          sousDomaines: { select: { id: true } },
        },
      },
    },
  });

  if (!sequence) notFound();

  const cycleId = sequence.matiere.classeur.niveau.cycleId;

  const [niveauxByCycle, disciplines] = await Promise.all([
    prisma.cycle.findMany({
      include: {
        niveaux: { orderBy: { ordre: 'asc' } },
      },
      orderBy: { code: 'asc' },
    }),
    prisma.discipline.findMany({
      where: { cycleId },
      include: {
        domaines: {
          where: { OR: [{ matiereId: null }, { matiereId }] },
          include: {
            sousDomaines: {
              where: { OR: [{ matiereId: null }, { matiereId }] },
              include: {
                objectifs: { orderBy: { label: 'asc' } },
              },
              orderBy: { label: 'asc' },
            },
          },
          orderBy: { label: 'asc' },
        },
      },
      orderBy: { label: 'asc' },
    }),
  ]);

  const referenceTree = {
    niveauxByCycle: niveauxByCycle.map((c) => ({
      cycleId: c.id,
      cycleLabel: c.label,
      niveaux: c.niveaux.map((n) => ({ value: n.id, label: n.label, code: n.code })),
    })),
    disciplines: disciplines.map((d) => ({
      value: d.id,
      label: d.label,
      domaines: d.domaines.map((dom) => ({
        value: dom.id,
        label: dom.label,
        disciplineId: dom.disciplineId,
        sousDomaines: dom.sousDomaines.map((sd) => ({
          value: sd.id,
          label: sd.label,
          domaineId: sd.domaineId,
          objectifs: sd.objectifs.map((o) => ({
            value: o.id,
            label: o.label,
            sousDomainId: o.sousDomainId,
          })),
        })),
      })),
    })),
  };

  const initialData = {
    id: sequence.id,
    titre: sequence.titre,
    niveauIds: sequence.niveaux.map((n) => n.id),
    periodeId: sequence.periodeId,
    objectifs: sequence.objectifs,
    disciplineIds: sequence.disciplines.map((d) => d.id),
    domaineIds: sequence.domaines.map((d) => d.id),
    sousDomainIds: sequence.sousDomaines.map((d) => d.id),
    objectifIds: sequence.objectifsLearning.map((o) => o.id),
    fiches: sequence.fiches.map((f) => ({
      id: f.id,
      titre: f.titre,
      sequenceId: f.sequenceId,
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
    matiere: {
      classeur: {
        niveauId: sequence.matiere.classeur.niveauId,
        anneeScolaireId: sequence.matiere.classeur.anneeScolaireId,
      },
      disciplineId: sequence.matiere.disciplineId,
    },
  };

  return (
    <main className="w-full">
      <Breadcrumb
        items={[
          { label: 'Mes classeurs', href: '/classeurs' },
          { label: sequence.matiere.classeur.titre, href: `/classeurs/${id}` },
          { label: sequence.matiere.titre, href: `/classeurs/${id}/matieres/${matiereId}` },
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
          initialFiches={initialData.fiches.map((f) => ({
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
