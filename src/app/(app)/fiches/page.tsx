import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function FichesPage() {
  const session = await auth();
  if (!session) redirect('/signin');

  return (
    <main>
      <h1>Mes fiches</h1>
      <p>Liste des fiches — à implémenter.</p>
    </main>
  );
}
