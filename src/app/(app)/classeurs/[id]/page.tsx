import { auth } from '@/lib/auth/auth';
import { redirect, notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { MatiereList } from '@/components/matieres/MatiereList';
import type { RouterOutputs } from '@/lib/trpc/types';

export default async function ClasseurPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session) redirect('/signin');

  const { id } = await params;

  const classeur = await prisma.classeur.findFirst({
    where: { id, userId: session.user!.id! },
    include: {
      niveau: { include: { cycle: true } },
      anneeScolaire: true,
      matieres: {
        orderBy: { ordre: 'asc' },
        include: {
          sousDomaine: { include: { domaine: true } },
          _count: { select: { sequences: true } },
        },
      },
    },
  });

  if (!classeur) notFound();

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <Breadcrumb
        items={[
          { label: 'Mes classeurs', href: '/classeurs' },
          { label: classeur.titre },
        ]}
      />

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{classeur.titre}</h1>
        <p className="text-sm text-gray-500 mt-1">
          {classeur.niveau.label} · {classeur.anneeScolaire.label} · {classeur.niveau.cycle.label}
        </p>
      </div>

      <MatiereList classeurId={id} initialMatieres={classeur.matieres as unknown as RouterOutputs['matiere']['list']} />
    </main>
  );
}
