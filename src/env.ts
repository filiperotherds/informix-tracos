import 'dotenv/config'
import { z } from 'zod';

export const envSchema = z.object({
  DB_TRACOS_URL: z.string(),
  INFORMIX_STRING: z.string(),
  JWT_PRIVATE_KEY: z.string(),
  JWT_PUBLIC_KEY: z.string(),
  PORT: z.coerce.number().optional().default(3333),
  TRACKIAN_API_URL: z.string(),
});

export type Env = z.infer<typeof envSchema>;

const _env = envSchema.safeParse(process.env)

if (_env.success === false) {
  console.error('Invalid enviromental variables.', _env.error.format())

  throw new Error('Invalid enviromental variables.')
}

export const env = _env.data