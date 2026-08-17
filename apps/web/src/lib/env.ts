import { z } from 'zod';

const environmentSchema = z.object({
  VITE_API_BASE_URL: z.url().default('http://localhost:3000'),
});

const parsedEnvironment = environmentSchema.safeParse(import.meta.env);

if (!parsedEnvironment.success) {
  throw new Error('Invalid frontend environment configuration.');
}

export const environment = parsedEnvironment.data;
