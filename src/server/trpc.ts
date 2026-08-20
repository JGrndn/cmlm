import { initTRPC } from '@trpc/server';
import { prisma } from '@/lib/prisma';

const t = initTRPC.create();

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;

export const createContext = async () => {
  return { prisma };
};

export type Context = Awaited<ReturnType<typeof createContext>>;
