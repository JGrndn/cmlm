import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ClasseurCard } from '@/components/classeurs/ClasseurCard';
import { ClasseurCreateButton } from '@/components/classeurs/ClasseurCreateButton';

export default async function ClasseursPage() {
  const session = await auth();
  if (!session) redirect('/signin');

  const classeurs = await prisma.classeur.findMany({
    where: { userId: session.user!.id! },
    include: {
      niveau: { include: { cycle: true } },
      anneeScolaire: true,
      _count: { select: { matieres: true } },
    },
    orderBy: [{ anneeScolaire: { debut: 'desc' } }, { createdAt: 'desc' }],
  });

  // Grouper par année scolaire
  const grouped = classeurs.reduce<Record<string, typeof classeurs>>(
    (acc, c) => {
      const key = c.anneeScolaire.label;
      if (!acc[key]) acc[key] = [];
      acc[key].push(c);
      return acc;
    },
    {},
  );

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mes classeurs</h1>
        <ClasseurCreateButton />
      </div>

      {Object.keys(grouped).length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg">Aucun classeur pour l'instant.</p>
          <p className="text-sm mt-1">Créez votre premier classeur pour commencer.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([annee, list]) => (
            <section key={annee}>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                {annee}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {list.map((c) => (
                  <ClasseurCard key={c.id} classeur={c} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}
