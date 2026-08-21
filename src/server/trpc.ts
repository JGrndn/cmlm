import { initTRPC, TRPCError } from '@trpc/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth/auth';

export const createContext = async () => {
  const session = await auth();
  return { prisma, session };
};

export type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create();

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session?.user?.id) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({
    ctx: {
      ...ctx,
      session: ctx.session as NonNullable<typeof ctx.session> & {
        user: NonNullable<typeof ctx.session.user> & { id: string };
      },
    },
  });
});
