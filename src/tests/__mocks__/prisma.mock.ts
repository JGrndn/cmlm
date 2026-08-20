import type { PrismaClient } from '@/generated/prisma/client';
import { mockDeep } from 'vitest-mock-extended';

export const prismaMock = mockDeep<PrismaClient>();
