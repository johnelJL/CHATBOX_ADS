import { test, expect } from '@playwright/test';

test('landing page loads', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await expect(page.getByRole('heading', { name: /trustworthy car listing/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /start selling/i })).toBeVisible();
});
