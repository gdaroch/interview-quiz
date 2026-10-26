import { test, expect } from '@playwright/test';

const SELECTED = ['Interviews', 'React'];

test('chooses topics, plays a full round and returns to the start screen', async ({ page }) => {
  await page.goto('/');

  // Start screen: every topic button is pressed by default
  await expect(page.getByRole('heading', { name: 'Interview Quiz' })).toBeVisible();
  const topicButtons = page.locator('#start-topics button');
  const topicCount = await topicButtons.count();
  expect(topicCount).toBeGreaterThan(SELECTED.length);
  await expect(page.locator('#start-topics button[aria-pressed="true"]')).toHaveCount(topicCount);

  // Deselect every topic except the chosen ones
  const names = await topicButtons.allTextContents();
  for (const name of names.filter((n) => !SELECTED.includes(n))) {
    await page.locator('#start-topics').getByRole('button', { name, exact: true }).click();
  }
  await expect(page.locator('#start-topics button[aria-pressed="true"]')).toHaveCount(SELECTED.length);
  for (const name of SELECTED) {
    await expect(page.locator('#start-topics').getByRole('button', { name, exact: true })).toHaveAttribute('aria-pressed', 'true');
  }

  // The round length comes from the page (it depends on the config and the filtered pool)
  const roundLength = Number(await page.locator('#start-count').textContent());
  expect(roundLength).toBeGreaterThan(0);
  await page.locator('#btn-start').click();

  for (let n = 1; n <= roundLength; n++) {
    await expect(page.locator('#q-progress')).toHaveText(`Question ${n} of ${roundLength}`);
    await expect(page.locator('#btn-submit')).toBeDisabled();

    // Every question belongs to a selected topic (CSS uppercases the badge, textContent does not)
    const badge = (await page.locator('#q-topic').textContent()).trim();
    expect(SELECTED).toContain(badge);

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
    await expect(next).toHaveText(n === roundLength ? 'See results' : 'Next');
    await next.click();
  }

  // Results screen
  await expect(page.getByRole('heading', { name: 'Round complete' })).toBeVisible();
  await expect(page.locator('#r-total')).toHaveText(String(roundLength));
  const score = Number(await page.locator('#r-score').textContent());
  expect(score).toBeGreaterThanOrEqual(0);
  expect(score).toBeLessThanOrEqual(roundLength);

  // Play again: back to the start screen with all topics selected again
  await page.locator('#btn-again').click();
  await expect(page.getByRole('heading', { name: 'Interview Quiz' })).toBeVisible();
  await expect(page.locator('#start-topics button')).toHaveCount(topicCount);
  await expect(page.locator('#start-topics button[aria-pressed="true"]')).toHaveCount(topicCount);
  await expect(page.locator('#btn-start')).toBeEnabled();
});
