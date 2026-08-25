import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import { classeurSvc, ficheSvc } from '@/server/services';
import { FichesGlobalesClient } from '@/components/fiches/FichesGlobalesClient';

export default async function FichesPage() {
  const session = await auth();
  if (!session) redirect('/signin');

  const userId = session.user!.id!;

  const classeurs = await classeurSvc.list(userId);

  const fichesByClasseur = await Promise.all(
    classeurs.map(async (classeur) => ({
      classeur: { id: classeur.id, titre: classeur.titre },
      fiches: await ficheSvc.listStandalone(classeur.id, userId),
    })),
  );

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mes fiches</h1>
      </div>
      <FichesGlobalesClient classeurs={classeurs} fichesByClasseur={fichesByClasseur} />
    </main>
  );
}
