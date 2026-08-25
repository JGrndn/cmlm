import { auth } from '@/lib/auth/auth';
import { redirect, notFound } from 'next/navigation';
import { classeurSvc, matiereSvc, sequenceSvc } from '@/server/services';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import Link from 'next/link';
import { Pencil } from 'lucide-react';

export default async function SequencePage({
  params,
}: {
  params: Promise<{ id: string; matiereId: string; sequenceId: string }>;
}) {
  const session = await auth();
  if (!session) redirect('/signin');

  const { id, matiereId, sequenceId } = await params;
  const userId = session.user!.id!;

  const [classeur, matiere, sequence] = await Promise.all([
    classeurSvc.getById(id, userId).catch(() => null),
    matiereSvc.getById(matiereId, userId).catch(() => null),
    sequenceSvc.getById(sequenceId, userId).catch(() => null),
  ]);

  if (!classeur || !matiere || !sequence) notFound();

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <Breadcrumb
        items={[
          { label: 'Mes classeurs', href: '/classeurs' },
          { label: classeur.titre, href: `/classeurs/${id}` },
          { label: matiere.titre, href: `/classeurs/${id}/matieres/${matiereId}` },
          { label: sequence.titre },
        ]}
      />

      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{sequence.titre}</h1>
          <div className="flex items-center gap-3 mt-1">
            {sequence.periodeLabel && (
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-medium">
                {sequence.periodeLabel}
              </span>
            )}
            <span className="text-sm text-gray-500">
              {sequence._count.fiches} séance{sequence._count.fiches !== 1 ? 's' : ''}
            </span>
          </div>
          {sequence.objectifs && (
            <p className="mt-2 text-sm text-gray-600">{sequence.objectifs}</p>
          )}
        </div>
        <Link
          href={`/classeurs/${id}/matieres/${matiereId}/sequences/${sequenceId}/edit`}
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-700 text-white text-sm rounded-md hover:bg-blue-800"
        >
          <Pencil className="h-4 w-4" /> Modifier la séquence
        </Link>
      </div>
    </main>
  );
}
