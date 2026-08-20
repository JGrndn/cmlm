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
