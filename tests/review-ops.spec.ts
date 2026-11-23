import { expect, test } from '@playwright/test';

test('review decisions, scenario isolation, reference assessment and exported verdict', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('/#review-ops');
  await expect(page.getByRole('heading', { name: 'Would you ship this?' })).toBeVisible();
  await page.getByText('E1 / Permitted interleaving', { exact: true }).click();
  await expect(page.getByText(/Initial available = 1/)).toBeVisible();
  for (let i = 0; i < 4; i++) await page.getByRole('button', { name: /Advance interleaving/ }).click();
  await expect(page.getByText('VIOLATED', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Atomic conditional update', exact: true }).click();
  for (let i = 0; i < 4; i++) await page.getByRole('button', { name: /Advance interleaving/ }).click();
  await expect(page.getByText('conflict', { exact: true })).toBeVisible();
  await expect(page.getByText('VIOLATED', { exact: true })).toHaveCount(0);
  await page.getByLabel('Classification', { exact: true }).selectOption('defect');
  await page.getByLabel('Engineering rationale', { exact: true }).first().fill('The concurrent interleaving violates the stock invariant.');
  await page.getByLabel('Evidence reference', { exact: true }).fill('E1; after L3–8');
  await page.getByRole('button', { name: /Security reviewer · HIGH/ }).click();
  await page.getByLabel('Classification', { exact: true }).selectOption('unsupported');
  await page.getByLabel('Engineering rationale', { exact: true }).first().fill('The query uses bound parameters.');
  await page.getByLabel('Evidence reference', { exact: true }).fill('E3');
  await page.getByRole('button', { name: /Maintainability reviewer/ }).click();
  await page.getByLabel('Classification', { exact: true }).selectOption('suggestion');
  await page.getByLabel('Engineering rationale', { exact: true }).first().fill('Optional readability change.');
  await page.getByLabel('Evidence reference', { exact: true }).fill('After L5–8');
  await expect(page.getByText('REQUEST CHANGES', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Compare with reference assessment' }).click();
  await expect(page.getByText('REFERENCE / SUGGESTION', { exact: true })).toBeVisible();
  const downloadEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export decision record', exact: true }).click();
  const download = await downloadEvent;
  const stream = await download.createReadStream();
  const chunks = []; for await (const chunk of stream!) chunks.push(chunk);
  const record = JSON.parse(Buffer.concat(chunks).toString());
  expect(record.fictional).toBe(true); expect(record.status.verdict).toBe('REQUEST CHANGES');
  expect(record.claims[0].decision.evidence).toBe('E1; after L3–8');
  await page.getByRole('button', { name: 'Fast, for the wrong account' }).click();
  await expect(page.getByLabel('Evidence reference', { exact: true })).toHaveValue('');
  await expect(page.getByText('REVIEW INCOMPLETE', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'The last unit', exact: true }).click();
  await expect(page.getByLabel('Evidence reference', { exact: true })).toHaveValue('E1; after L3–8');
  expect(errors).toEqual([]);
  await page.locator('.review-lab').screenshot({ path: 'test-results/review-ops-desktop.png' });
});

test('report import validation and empty reports do not imply reviewed status', async ({ page }) => {
  await page.goto('/#review-ops');
  await page.getByRole('button', { name: 'IMPORT / EDIT JSON' }).click();
  const input = page.getByLabel('REVIEWER REPORTS / JSON ARRAY / UP TO 250 ENTRIES');
  await input.fill('[{"line":0}]');
  await page.getByRole('button', { name: 'PROCESS REVIEW REPORT' }).click();
  await expect(page.getByRole('alert')).toContainText('Row 1');
  await input.fill('[]');
  await page.getByRole('button', { name: 'PROCESS REVIEW REPORT' }).click();
  await expect(page.getByText(/DECISION LEDGER \/ 0 OF 0 ISSUES RESOLVED \/ DRAFT/)).toBeVisible();
});

test('mobile layout, keyboard entry, and reduced motion', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.keyboard.press('Tab');
  // First navigation remains usable; skip link is reachable without a pointer.
  const skip = page.getByRole('link', { name: 'Skip to content' });
  await skip.focus(); await expect(skip).toBeFocused(); await page.keyboard.press('Enter');
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await page.getByRole('navigation').getByRole('link', { name: 'Review Ops' }).click();
  await expect(page.getByRole('heading', { name: 'Would you ship this?' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.locator('.review-lab').screenshot({ path: 'test-results/review-ops-mobile.png' });
});
