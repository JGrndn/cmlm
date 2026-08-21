import { NextAuthConfig } from 'next-auth';
import { UserRole } from '@/lib/domain/enums/user-role.enum';

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: '/signin',
    error: '/error',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isPublicPath = ['/signin', '/error'].some(
        (p) => nextUrl.pathname.startsWith(p),
      );

      if (isLoggedIn && isPublicPath) {
        return Response.redirect(new URL('/classeurs', nextUrl));
      }
      if (!isLoggedIn && !isPublicPath) {
        return false;
      }
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.role = token.role as UserRole;
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
