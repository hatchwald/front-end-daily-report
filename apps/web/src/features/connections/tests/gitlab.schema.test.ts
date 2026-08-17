import { describe, expect, it } from 'vitest';

import { gitLabServerSchema } from '@/features/connections/schemas/gitlab.schema';

describe('self-hosted GitLab URL validation', () => {
  it('accepts HTTPS server URLs', () => {
    expect(gitLabServerSchema.safeParse({ baseUrl: 'https://git.company.example' }).success).toBe(
      true,
    );
  });

  it('rejects non-HTTP protocols', () => {
    expect(gitLabServerSchema.safeParse({ baseUrl: 'javascript:alert(1)' }).success).toBe(false);
  });
});
