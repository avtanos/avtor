import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { z } from 'zod';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const envSchema = z.object({
  API_PORT: z.coerce.number().int().positive().default(4000),
  POSTGRES_HOST: z.string().default('localhost'),
  POSTGRES_PORT: z.coerce.number().int().positive().default(5432),
  POSTGRES_DB: z.string().default('jmp'),
  POSTGRES_USER: z.string().default('jmp'),
  POSTGRES_PASSWORD: z.string().default('jmp'),
  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),
  ACCESS_TOKEN_TTL_SECONDS: z.coerce.number().int().positive().default(900),
  REFRESH_TOKEN_TTL_SECONDS: z.coerce.number().int().positive().default(2_592_000)
});

export const env = (() => {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    // eslint-disable-next-line no-console
    console.error(parsed.error.flatten().fieldErrors);
    throw new Error('Invalid environment variables');
  }
  return parsed.data;
})();

const defaultSqliteDbPath = path.resolve(__dirname, '../prisma/dev.db');
const defaultSqliteDbUrl = `file:${defaultSqliteDbPath.replaceAll('\\', '/')}`;

export const DATABASE_URL = process.env.DATABASE_URL ?? defaultSqliteDbUrl;

