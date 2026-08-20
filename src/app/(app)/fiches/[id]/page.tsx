import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function FichePage({ params }: Props) {
  const session = await auth();
  if (!session) redirect('/signin');

  const { id } = await params;

  return (
    <main>
      <h1>Fiche {id}</h1>
      <p>Éditeur de fiche — à implémenter.</p>
    </main>
  );
}
