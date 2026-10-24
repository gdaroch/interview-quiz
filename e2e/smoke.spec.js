import { test, expect } from '@playwright/test';

// Placeholder: replaced by the happy-path e2e tests once the game flow exists.
test('shows the start screen', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Interview Quiz' })).toBeVisible();
});
