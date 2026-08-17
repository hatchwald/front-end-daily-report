import { z } from 'zod';

export const gitLabServerSchema = z.object({
  baseUrl: z
    .url('Enter a valid GitLab server URL.')
    .refine(
      (value) => ['http:', 'https:'].includes(new URL(value).protocol),
      'Use an HTTP or HTTPS URL.',
    ),
});
