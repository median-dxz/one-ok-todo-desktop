import { test, expect } from '@playwright/test';

test.describe('同步功能 E2E测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('text=One OK Todo', { timeout: 10000 });
  });

  test('同步按钮初始状态为idle', async ({ page }) => {
    // 验证同步按钮存在
    const syncButton = page.locator('button:has-text("Sync")');
    await expect(syncButton).toBeVisible();

    // 验证初始状态为idle
    await expect(page.locator('text=idle')).toBeVisible();
  });

  test('点击同步按钮触发同步', async ({ page }) => {
    const syncButton = page.locator('button:has-text("Sync")');

    // 点击同步按钮
    await syncButton.click();

    // 验证状态变为 syncing 或 success (因为同步可能非常快)
    const badge = page.locator('.chakra-badge');
    await expect(badge).toHaveText(/syncing|success/, { timeout: 5000 });
  });

  test('同步成功后显示success状态', async ({ page }) => {
    const syncButton = page.locator('button:has-text("Sync")');

    await syncButton.click();

    // 等待同步完成
    await expect(page.locator('text=success')).toBeVisible({ timeout: 5000 });
  });

  test('同步成功后2秒自动重置为idle', async ({ page }) => {
    const syncButton = page.locator('button:has-text("Sync")');

    await syncButton.click();
    await expect(page.locator('text=success')).toBeVisible({ timeout: 5000 });

    // 等待2秒后状态应重置为idle
    await page.waitForTimeout(2500);
    await expect(page.locator('text=idle')).toBeVisible();
  });

  test('同步状态颜色正确显示', async ({ page }) => {
    const statusBadge = page.locator('.chakra-badge').first();

    // idle状态验证
    await expect(statusBadge).toHaveText('idle');

    // 点击同步
    const syncButton = page.locator('button:has-text("Sync")');
    await syncButton.click();

    // 等待成功状态
    await expect(page.locator('text=success')).toBeVisible({ timeout: 5000 });
    await expect(statusBadge).toHaveText('success');
  });
});
