import { test, expect } from '@playwright/test';

const SELECTED = ['JavaScript', 'Security'];

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

test('shows colored tokens in the code block of a SQL question', async ({ page }) => {
  // Math.random just below 1 makes every shuffle keep the bank order, so a round is
  // the first questions of the chosen topic and its SQL questions are always included
  await page.addInitScript(() => {
    Math.random = () => 0.999999;
  });
  await page.goto('/');

  // Databases holds the SQL questions; keep only that topic
  const topics = page.locator('#start-topics');
  const names = await topics.locator('button').allTextContents();
  for (const name of names.filter((n) => n !== 'Databases')) {
    await topics.getByRole('button', { name, exact: true }).click();
  }
  await expect(page.locator('#start-topics button[aria-pressed="true"]')).toHaveCount(1);
  await page.locator('#btn-start').click();

  // Answer questions until the SQL one appears (the third one of the round)
  const code = page.locator('#q-code-body');
  for (let n = 1; n <= 10; n++) {
    if (await code.evaluate((el) => el.classList.contains('language-sql'))) break;
    await page.locator('#q-options').getByRole('radio').first().check();
    await page.locator('#btn-submit').click();
    await page.locator('#btn-next').click();
  }

  await expect(code).toHaveClass(/language-sql/);
  await expect(page.locator('#q-code')).toBeVisible();
  await expect(code.locator('[class*="hljs-"]').first()).toBeVisible();
});

test('opens the full explanation, follows a link, goes back and resumes the round untouched', async ({ page }) => {
  // Fixed shuffle so the round order is deterministic
  await page.addInitScript(() => {
    Math.random = () => 0.999999;
  });
  await page.goto('/');

  // Node.js & HTTP guide sections link to other sections; keep only that topic
  const topics = page.locator('#start-topics');
  const names = await topics.locator('button').allTextContents();
  for (const name of names.filter((n) => n !== 'Node.js & HTTP')) {
    await topics.getByRole('button', { name, exact: true }).click();
  }
  await expect(page.locator('#start-topics button[aria-pressed="true"]')).toHaveCount(1);
  await page.locator('#btn-start').click();

  const roundLength = Number(/of (\d+)/.exec(await page.locator('#q-progress').textContent())[1]);
  const radios = page.locator('#q-options').getByRole('radio');
  const dialog = page.locator('#guide-dialog');
  const link = page.locator('#guide-body a[href^="#"]').first();

  // Not every guide section has internal links, so answer questions until one does
  // (the last question is skipped so there is always a next one to continue with)
  let found = false;
  for (let n = 1; n < roundLength && !found; n++) {
    await expect(page.locator('#q-progress')).toHaveText(`Question ${n} of ${roundLength}`);
    await expect(page.locator('#btn-guide')).toBeHidden();
    await radios.first().check();
    await page.locator('#btn-submit').click();
    await expect(page.locator('#btn-guide')).toBeVisible();

    await page.locator('#btn-guide').click();
    await expect(dialog).toHaveJSProperty('open', true);
    found = (await link.count()) > 0;
    if (!found) {
      await page.locator('#guide-close').click();
      await expect(dialog).toHaveJSProperty('open', false);
      await page.locator('#btn-next').click();
    }
  }
  expect(found, 'some question in the round links to a guide section with internal links').toBe(true);

  // Close to capture the question state, then reopen
  await page.locator('#guide-close').click();
  await expect(dialog).toHaveJSProperty('open', false);
  const snapshot = async () => ({
    text: await page.locator('#q-text').textContent(),
    verdict: await page.locator('#q-verdict').textContent(),
    explanation: await page.locator('#q-explanation').textContent(),
    score: await page.locator('#q-score').textContent(),
    progress: await page.locator('#q-progress').textContent(),
    checked: await radios.evaluateAll((els) => els.map((el) => el.checked)),
  });
  const before = await snapshot();
  expect(before.checked.filter(Boolean)).toHaveLength(1);

  await page.locator('#btn-guide').click();
  await expect(dialog).toHaveJSProperty('open', true);
  await expect(page.locator('#guide-title')).not.toBeEmpty();
  await expect(page.locator('#guide-body')).not.toBeEmpty();
  await expect(page.locator('#guide-back')).toBeHidden();
  const firstTitle = await page.locator('#guide-title').textContent();

  // Following an internal link shows another section without touching the URL
  const urlBefore = page.url();
  await link.click();
  await expect(page.locator('#guide-title')).not.toHaveText(firstTitle);
  await expect(page.locator('#guide-back')).toBeVisible();
  expect(page.url()).toBe(urlBefore);

  // Back returns to the first section
  await page.locator('#guide-back').click();
  await expect(page.locator('#guide-title')).toHaveText(firstTitle);
  await expect(page.locator('#guide-back')).toBeHidden();

  // Close button: focus returns to the opener and the question is unchanged
  await page.locator('#guide-close').click();
  await expect(dialog).toHaveJSProperty('open', false);
  await expect(page.locator('#btn-guide')).toBeFocused();
  expect(await snapshot()).toEqual(before);

  // Escape closes it too
  await page.locator('#btn-guide').click();
  await expect(dialog).toHaveJSProperty('open', true);
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveJSProperty('open', false);
  await expect(page.locator('#btn-guide')).toBeFocused();
  expect(await snapshot()).toEqual(before);

  // The round continues: next question, guide button hidden again
  await page.locator('#btn-next').click();
  const next = Number(/Question (\d+)/.exec(before.progress)[1]) + 1;
  await expect(page.locator('#q-progress')).toHaveText(`Question ${next} of ${roundLength}`);
  await expect(page.locator('#btn-guide')).toBeHidden();
});
