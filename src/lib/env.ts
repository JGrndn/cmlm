import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  AUTH_DATABASE_URL: z.string().min(1, 'AUTH_DATABASE_URL is required'),
  NEXTAUTH_SECRET: z.string().min(1, 'NEXTAUTH_SECRET is required'),
  NEXT_PUBLIC_APP_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

const skip = process.env.SKIP_ENV_VALIDATION === 'true';
export const env = skip
  ? (process.env as unknown as z.infer<typeof envSchema>)
  : envSchema.parse(process.env);
