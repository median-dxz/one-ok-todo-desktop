import { test, expect } from '@playwright/test';

test('Take a screenshot of the main window', async ({ page }) => {
  // The vite server should be running for this to work
  await page.goto('http://localhost:1420');

  // Wait for the canvas to be rendered
  await page.waitForSelector('canvas');

  // Take a screenshot
  await page.screenshot({ path: 'tests/current-view.png', fullPage: true });
});
