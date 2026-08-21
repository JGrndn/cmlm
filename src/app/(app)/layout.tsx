import { NavigationProvider } from '@/components/navigation';
import { Layout } from '@/components/layout/Layout';

export const metadata = {
  title: 'CMLM',
  description: 'Cahier de mise en ligne des matières',
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const platform = process.env.NEXT_PUBLIC_APP_ENV === 'production' ? '' : process.env.NEXT_PUBLIC_APP_ENV;

  return (
    <NavigationProvider>
      <Layout title="CMLM" platform={platform}>
        {children}
      </Layout>
    </NavigationProvider>
  );
}
