import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect('/signin');

  return (
    <main>
      <h1>Dashboard</h1>
      <p>Connecté en tant que {session.user?.email}</p>
    </main>
  );
}
