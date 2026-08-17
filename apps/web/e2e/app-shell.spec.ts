import { expect, test } from '@playwright/test';

test('signs in and shows the responsive application shell', async ({ page }) => {
  let authenticated = false;
  await page.route('http://localhost:3000/api/v1/auth/me', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      status: authenticated ? 200 : 401,
      body: authenticated
        ? JSON.stringify({
            success: true,
            data: {
              user: {
                id: 'user-1',
                email: 'dev@example.com',
                name: 'Dev',
                timezone: 'Asia/Jakarta',
              },
            },
          })
        : JSON.stringify({
            success: false,
            error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
          }),
    });
  });
  await page.route('http://localhost:3000/api/v1/auth/login', async (route) => {
    authenticated = true;
    await route.fulfill({
      contentType: 'application/json',
      status: 200,
      body: JSON.stringify({
        success: true,
        data: {
          user: {
            id: 'user-1',
            email: 'dev@example.com',
            name: 'Dev',
            timezone: 'Asia/Jakarta',
          },
        },
      }),
    });
  });
  await page.route('http://localhost:3000/api/v1/connections/', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      status: 200,
      body: JSON.stringify({
        success: true,
        data: [
          {
            id: 'connection-1',
            provider: 'github',
            baseUrl: 'https://github.com',
            providerUsername: 'dev',
            installationId: '1',
            status: 'active',
            createdAt: '2026-08-18T00:00:00.000Z',
          },
        ],
      }),
    });
  });
  await page.route('http://localhost:3000/api/v1/reports/generate', async (route) => {
    const request = route.request();
    const input = request.postDataJSON() as { date: string };
    await route.fulfill({
      contentType: 'application/json',
      status: 200,
      body: JSON.stringify({
        success: true,
        data: {
          id: 'report-1',
          reportDate: input.date,
          summary: 'Worked on the dashboard.',
          totalCommits: 3,
          totalMergeRequests: 1,
          totalReviews: 0,
          generatedAt: '2026-08-18T00:00:00.000Z',
          items: [],
        },
      }),
    });
  });

  await page.goto('/');
  await page.getByLabel('Email').fill('dev@example.com');
  await page.getByLabel('Password').fill('correct-horse-battery-staple');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeVisible();
  await page.getByRole('link', { name: 'Reports' }).click();
  await expect(page.getByText('GitHub · dev')).toBeVisible();
  await page.getByRole('button', { name: 'Generate report' }).click();
  await expect(page.getByText('Worked on the dashboard.')).toBeVisible();
});
