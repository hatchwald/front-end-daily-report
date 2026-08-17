import { z } from 'zod';

export const loginSchema = z.object({
  email: z.email('Enter a valid email address.').max(254),
  password: z.string().min(1, 'Enter your password.').max(128),
});

export const registerSchema = loginSchema.extend({
  name: z.string().trim().max(100, 'Name must be 100 characters or fewer.'),
  password: z.string().min(12, 'Password must contain at least 12 characters.').max(128),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
