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

  await page.goto('/');
  await page.getByLabel('Email').fill('dev@example.com');
  await page.getByLabel('Password').fill('correct-horse-battery-staple');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeVisible();
});
