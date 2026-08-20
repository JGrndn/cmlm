---
name: scaffold
description: Bootstrappe un nouveau projet Next.js avec la stack standard (Next 16, React 19, Prisma 7, PostgreSQL, NextAuth v5, Zod 4, SWR 2, Tailwind CSS 3, Vitest 4, Docker multi-stage). Crée la structure de dossiers, les fichiers de config, les boilerplates architecturaux et installe les dépendances npm.
---

# Scaffold — Initialisation d'un projet Next.js

Suis ces étapes dans l'ordre pour bootstrapper un nouveau projet.

## Étape 1 — Nom du projet

Demande à l'utilisateur le **nom du projet** (snake_case ou kebab-case, sans espaces). Utilise cette valeur comme `PROJECT_NAME` dans toutes les étapes suivantes.

## Étape 2 — Structure de dossiers

Crée les dossiers suivants (avec `mkdir -p` sur Unix/Mac, ou `New-Item -ItemType Directory -Force` sur Windows) :

```
prisma/migrations
public
src/app/(app)
src/app/(auth)/signin
src/app/api/auth/[...nextauth]
src/components
src/generated/prisma
src/lib/api
src/lib/audit
src/lib/auth
src/lib/domain/enums
src/lib/dto
src/lib/errors
src/lib/hooks
src/lib/i18n
src/lib/mappers
src/lib/middleware
src/lib/schemas
src/lib/services
src/lib/zod
src/tests/__mocks__
src/types
```

## Étape 3 — Fichiers de configuration

Crée chacun des fichiers suivants avec exactement ce contenu.

### `package.json`

Remplace `PROJECT_NAME` par le nom choisi à l'étape 1.

```json
{
  "name": "PROJECT_NAME",
  "version": "0.1.0",
  "description": "",
  "main": "next.config.js",
  "scripts": {
    "dev:install": "npm i",
    "dev": "cross-env NEXT_PUBLIC_APP_ENV=development next dev -H 0.0.0.0",
    "dev:test": "cross-env NEXT_PUBLIC_APP_ENV=test next dev -H 0.0.0.0",
    "dev:prod": "cross-env NEXT_PUBLIC_APP_ENV=production next dev -H 0.0.0.0",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:seed": "tsx prisma/seed.ts",
    "prisma:studio": "prisma studio",
    "build": "next build",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "@auth/prisma-adapter": "^2.11.1",
    "@prisma/adapter-pg": "^7.1.0",
    "@prisma/client": "^7.1.0",
    "@react-pdf/renderer": "^4.3.2",
    "bcryptjs": "^3.0.3",
    "clsx": "^2.1.1",
    "lucide-react": "^0.556.0",
    "next": "^16.1.6",
    "next-auth": "^5.0.0-beta.30",
    "pg": "^8.16.3",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "swr": "^2.3.7",
    "zod": "^4.2.1"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.6",
    "@types/node": "^24.10.1",
    "@types/pg": "^8.15.6",
    "@types/react": "19.2.10",
    "@vitest/coverage-v8": "^4.1.7",
    "autoprefixer": "^10.4.22",
    "cross-env": "^10.1.0",
    "dotenv": "^17.4.2",
    "postcss": "^8.5.6",
    "prisma": "^7.4.0",
    "tailwindcss": "^3.4.18",
    "tailwindcss-animate": "^1.0.7",
    "tsx": "^4.21.0",
    "typescript": "5.9.3",
    "vitest": "^4.1.7",
    "vitest-mock-extended": "^4.0.0"
  }
}
```

### `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts"
  ],
  "exclude": ["node_modules"]
}
```

### `next.config.js`

```js
/** @type {import('next').NextConfig} */
const packageJson = require('./package.json');

const nextConfig = {
  output: 'standalone',
  env: {
    NEXT_PUBLIC_APP_VERSION: packageJson.version,
  },
  images: {
    domains: [],
  },
};

module.exports = nextConfig;
```

### `tailwind.config.js`

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

### `postcss.config.js`

```js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

### `vitest.config.ts`

```ts
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./src/tests/setup.ts'],
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: [
        'src/lib/domain/**/*.ts',
        'src/lib/services/**/*.ts',
        'src/lib/mappers/**/*.ts',
      ],
      exclude: [
        'src/lib/domain/enums/**',
      ],
    },
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
});
```

### `prisma.config.ts`

```ts
import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});
```

### `Dockerfile`

```dockerfile
FROM node:22-alpine AS base

# ─── Étape 1 : dépendances ────────────────────────────────────────────────────
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ─── Étape 2 : build ─────────────────────────────────────────────────────────
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ARG DATABASE_URL=postgresql://placeholder:placeholder@placeholder:5432/placeholder
ENV DATABASE_URL=${DATABASE_URL}
ENV SKIP_ENV_VALIDATION=true

RUN npx prisma generate
RUN npm run build

# ─── Étape 3 : image finale (standalone) ─────────────────────────────────────
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src/generated ./src/generated
COPY --from=builder --chown=nextjs:nodejs /app/prisma.config.ts ./

COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

ENTRYPOINT ["./docker-entrypoint.sh"]
```

### `docker-entrypoint.sh`

```sh
#!/bin/sh
set -e

echo "→ Applying database migrations..."
npx prisma migrate deploy

echo "→ Starting Next.js..."
exec node server.js
```

### `.dockerignore`

```
node_modules
.next
.git
*.env
*.md
prisma/migrations/dev*
src/tests
coverage
*.test.ts
vitest.config.ts
```

### `.env.local.example`

```
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
NEXTAUTH_SECRET=your-secret-here
AUTH_SECRET=your-auth-secret-here
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_ENV=development
```

## Étape 4 — Fichiers boilerplate

### `prisma/schema.prisma`

```prisma
generator client {
  provider        = "prisma-client-js"
  output          = "../src/generated/prisma"
  previewFeatures = ["driverAdapters"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  ADMIN
  MANAGER
  CONTRIBUTOR
  VIEWER
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  password  String?
  role      Role     @default(VIEWER)
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("users")
}
```

### `prisma/seed.ts`

```ts
import { PrismaClient } from '../src/generated/prisma/client';

const prisma = new PrismaClient();

async function main() {
  // TODO: ajouter les seeds ici
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

### `src/lib/env.ts`

```ts
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  NEXTAUTH_SECRET: z.string().min(1, 'NEXTAUTH_SECRET is required'),
  NEXT_PUBLIC_APP_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

const skip = process.env.SKIP_ENV_VALIDATION === 'true';
export const env = skip
  ? (process.env as unknown as z.infer<typeof envSchema>)
  : envSchema.parse(process.env);
```

### `src/lib/prisma.ts`

```ts
import { PrismaClient } from '@/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { env } from '@/lib/env';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: env.NEXT_PUBLIC_APP_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (env.NEXT_PUBLIC_APP_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

### `src/lib/errors/domain-error.ts`

```ts
export class DomainError extends Error {
  constructor(
    message: string,
    public readonly code: string
  ) {
    super(message);
  }
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'An unexpected error occurred';
}
```

### `src/lib/domain/enums/user-role.enum.ts`

```ts
export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  CONTRIBUTOR = 'CONTRIBUTOR',
  VIEWER = 'VIEWER',
}

export const WRITE_ROLES = [UserRole.ADMIN, UserRole.MANAGER, UserRole.CONTRIBUTOR];
export const DELETE_ROLES = [UserRole.ADMIN, UserRole.MANAGER];
```

### `src/lib/auth/auth.config.ts`

```ts
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
      const isOnDashboard = !nextUrl.pathname.startsWith('/auth');
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false;
      } else if (isLoggedIn) {
        return Response.redirect(new URL('/', nextUrl));
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
```

### `src/lib/auth/auth.ts`

```ts
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { authConfig } from './auth.config';
import { UserRole } from '@/lib/domain/enums/user-role.enum';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: { strategy: 'jwt' },
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
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user || !user.password || !user.isActive) return null;

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role as unknown as UserRole,
        };
      },
    }),
  ],
});
```

### `src/lib/auth/index.ts`

```ts
export { handlers, auth, signIn, signOut } from './auth';
export { authConfig } from './auth.config';
```

### `src/types/next-auth.d.ts`

```ts
import { UserRole } from '@/lib/domain/enums/user-role.enum';
import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: UserRole;
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    role: UserRole;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: UserRole;
  }
}
```

### `src/tests/setup.ts`

```ts
import { beforeEach, vi } from 'vitest';

beforeEach(() => {
  vi.clearAllMocks();
});
```

### `src/tests/__mocks__/prisma.mock.ts`

```ts
import type { PrismaClient } from '@/generated/prisma/client';
import { mockDeep } from 'vitest-mock-extended';

export const prismaMock = mockDeep<PrismaClient>();
```

### `src/app/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### `src/app/layout.tsx`

```tsx
import '@/app/globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
```

### `src/app/(app)/page.tsx`

```tsx
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
```

### `src/app/(auth)/signin/page.tsx`

```tsx
export default function SignInPage() {
  return (
    <main>
      <h1>Connexion</h1>
      {/* TODO: formulaire de connexion */}
    </main>
  );
}
```

### `src/app/api/auth/[...nextauth]/route.ts`

```ts
import { handlers } from '@/lib/auth';

export const { GET, POST } = handlers;
```

## Étape 5 — Installation des dépendances

Exécute :

```bash
npm install
```

## Étape 6 — Résumé

Affiche ce message à l'utilisateur :

---

**Projet `PROJECT_NAME` initialisé.**

Prochaines étapes :

1. Copier `.env.local.example` → `.env.local` et renseigner `DATABASE_URL`, `NEXTAUTH_SECRET`, `AUTH_SECRET`
2. Compléter `prisma/schema.prisma` avec les entités du domaine
3. Lancer `npm run prisma:migrate` pour créer la base de données
4. Lancer `npm run prisma:generate` pour générer le client Prisma
5. Lancer `npm run dev` pour démarrer le serveur de développement

**Architecture :**

- `src/lib/services/` — couche d'accès aux données (une classe par entité)
- `src/lib/mappers/` — conversion Prisma model ↔ DTO
- `src/lib/dto/` — types DTO
- `src/lib/schemas/` — schémas Zod de validation
- `src/lib/domain/` — logique métier
