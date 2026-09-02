import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prismaAuth } from '@/lib/prisma-auth';
import { authConfig } from './auth.config';
import { UserRole } from '@/lib/domain/enums/user-role.enum';

const APP_NAME = 'cmlm';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: { strategy: 'jwt' },
  // Définir NEXTAUTH_COOKIE_DOMAIN=.mondomaine.home pour activer le SSO cross-app
  ...(process.env.NEXTAUTH_COOKIE_DOMAIN
    ? {
        cookies: {
          sessionToken: {
            options: {
              domain: process.env.NEXTAUTH_COOKIE_DOMAIN,
              path: '/',
              sameSite: 'lax' as const,
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
            },
          },
        },
      }
    : {}),
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const user = await prismaAuth.user.findUnique({ where: { email } });

        if (!user || !user.password || !user.isActive) return null;

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) return null;

        const perm = await prismaAuth.appPermission.findUnique({
          where: { userId_app: { userId: user.id, app: APP_NAME } },
        });
        if (!perm) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: perm.role as UserRole,
        };
      },
    }),
  ],
});
