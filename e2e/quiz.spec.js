import { test, expect } from '@playwright/test';

const ROUND_LENGTH = 3;

test('plays a full round and starts a fresh one', async ({ page }) => {
  await page.goto('/');

  // Start screen
  await expect(page.getByRole('heading', { name: 'Interview Quiz' })).toBeVisible();
  await page.locator('#btn-start').click();

  for (let n = 1; n <= ROUND_LENGTH; n++) {
    await expect(page.locator('#q-progress')).toHaveText(`Question ${n} of ${ROUND_LENGTH}`);
    await expect(page.locator('#btn-submit')).toBeDisabled();

    // Pick any option (order and correct answer are shuffled)
    const radios = page.locator('#q-options').getByRole('radio');
    await radios.first().check();
    await expect(page.locator('#btn-submit')).toBeEnabled();
    await page.locator('#btn-submit').click();

    // Feedback: verdict, explanation, locked options
    await expect(page.locator('#q-verdict')).toHaveText(/^(Correct!|Incorrect)$/);
    await expect(page.locator('#q-explanation')).not.toBeEmpty();
    const count = await radios.count();
    for (let i = 0; i < count; i++) {
      await expect(radios.nth(i)).toBeDisabled();
    }

    const next = page.locator('#btn-next');
    await expect(next).toHaveText(n === ROUND_LENGTH ? 'See results' : 'Next');
    await next.click();
  }

  // Results screen
  await expect(page.getByRole('heading', { name: 'Round complete' })).toBeVisible();
  await expect(page.locator('#r-total')).toHaveText(String(ROUND_LENGTH));
  const score = Number(await page.locator('#r-score').textContent());
  expect(score).toBeGreaterThanOrEqual(0);
  expect(score).toBeLessThanOrEqual(ROUND_LENGTH);

  // Play again: fresh round
  await page.locator('#btn-again').click();
  await expect(page.locator('#q-progress')).toHaveText(`Question 1 of ${ROUND_LENGTH}`);
  await expect(page.locator('#q-score')).toHaveText('Score: 0');
});
