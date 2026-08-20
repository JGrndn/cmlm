import '@/app/globals.css';
import { TRPCProvider } from '@/lib/trpc/Provider';
import { SessionProvider } from '@/components/auth/SessionProvider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <SessionProvider>
          <TRPCProvider>{children}</TRPCProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
