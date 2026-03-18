import { test, expect } from '@playwright/test';

test.describe('Timeline功能 E2E测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 等待应用加载完成
    await page.waitForSelector('text=One OK Todo', { timeout: 10000 });

    // 加载 Mock 数据以确保有基础数据
    await page.locator('button:has-text("Mock")').click();
  });

  test('应用初始化并加载模拟数据', async ({ page }) => {
    // 验证应用标题
    await expect(page.locator('text=One OK Todo')).toBeVisible();

    // 验证Timeline视图按钮存在
    await expect(page.locator('button:has-text("Timeline")')).toBeVisible();

    // 验证Memo视图按钮存在
    await expect(page.locator('button:has-text("Memo")')).toBeVisible();

    // 验证同步按钮存在
    await expect(page.locator('button:has-text("Sync")')).toBeVisible();
  });

  test('创建新的时间线组', async ({ page }) => {
    // 点击左侧导航栏的"新建"按钮
    await page.locator('nav button:has-text("新建")').click();

    // 等待对话框打开
    await expect(page.locator('text=创建组')).toBeVisible();

    // 输入组名称
    const groupName = '测试分组 ' + Date.now();
    await page.locator('input[placeholder*="组名称"]').fill(groupName);

    // 点击保存按钮
    await page.locator('button:has-text("创建")').click();

    // 验证新分组出现在列表中
    await expect(page.locator(`text=${groupName}`)).toBeVisible();
  });

  test('编辑时间线组名称', async ({ page }) => {
    // 等待有时间线组存在
    const firstGroup = page.locator('[data-swapy-item]').first();
    await expect(firstGroup).toBeVisible();

    // 点击更多操作按钮
    await firstGroup.locator('button[aria-label*="更多操作"]').click();

    // 点击编辑菜单项
    await page.locator('div[role="menuitem"]:has-text("编辑")').click();

    // 等待对话框打开
    await expect(page.locator('text=编辑组')).toBeVisible();

    // 修改组名称
    const newName = '修改后的分组 ' + Date.now();
    const input = page.locator('input[placeholder*="组名称"]');
    await input.clear();
    await input.fill(newName);

    // 保存更改
    await page.locator('button:has-text("保存")').click();

    // 验证名称已更新
    await expect(page.locator(`text=${newName}`).first()).toBeVisible();
  });

  test('删除时间线组', async ({ page }) => {
    // 创建一个新分组用于删除
    await page.locator('nav button:has-text("新建")').click();
    await expect(page.locator('text=创建组')).toBeVisible();

    const groupName = '待删除分组 ' + Date.now();
    await page.locator('input[placeholder*="组名称"]').fill(groupName);
    await page.locator('button:has-text("创建")').click();
    await expect(page.locator(`text=${groupName}`)).toBeVisible();

    // 找到该分组并点击更多操作
    const group = page.locator(`text=${groupName}`).locator('..').locator('..');
    await group.locator('button[aria-label*="更多操作"]').click();

    // 点击删除菜单项
    await page.locator('div[role="menuitem"]:has-text("删除")').click();

    // 验证分组已被删除
    await expect(page.locator(`text=${groupName}`)).not.toBeVisible();
  });

  test('切换选中的时间线组', async ({ page }) => {
    const groups = page.locator('[data-swapy-item]');
    const count = await groups.count();

    if (count >= 2) {
      // 确保第一个被选中
      await groups.first().click();
      await expect(groups.first()).toHaveAttribute('aria-selected', 'true');

      // 点击第二个分组
      await groups.nth(1).click();

      // 验证选中状态切换
      await expect(groups.first()).toHaveAttribute('aria-selected', 'false');
      await expect(groups.nth(1)).toHaveAttribute('aria-selected', 'true');
    }
  });

  test('在时间线组内创建新时间线', async ({ page }) => {
    // 确保有选中的时间线组
    const group = page.locator('[data-swapy-item]').first();
    await group.click();

    // 检查是否显示空状态，如果是则点击"新建"按钮
    if (await page.locator('text=尚未选择时间线组').isVisible()) {
      // 需要先选一个组
      await page.locator('[data-swapy-item]').first().click();
    }

    if (await page.locator('text=创建一条时间线').isVisible()) {
      await page.locator('button:has-text("新建")').click();

      // 等待对话框出现
      await expect(page.locator('text=创建时间线')).toBeVisible();

      // 输入时间线标题
      const timelineName = '测试时间线 ' + Date.now();
      await page.locator('input[placeholder*="时间线名称"]').fill(timelineName);

      // 保存
      await page.locator('button:has-text("创建")').click();

      // 验证时间线出现在视图中
      await expect(page.locator(`text=${timelineName}`)).toBeVisible();
    } else {
      // 否则使用 TimelineChat
      const input = page.locator('input[placeholder*="New timeline title"]');
      const timelineName = '测试时间线 ' + Date.now();
      await input.fill(timelineName);
      await page.locator('button:has-text("Add Timeline")').click();

      // 验证时间线出现在视图中
      await expect(page.locator(`text=${timelineName}`)).toBeVisible();
    }
  });

  test('创建任务节点', async ({ page }) => {
    // 确保选中一个时间线组以显示 ReactFlow
    const group = page.locator('[data-swapy-item]').first();
    await group.click();

    // 等待ReactFlow加载完成
    await page.waitForSelector('.react-flow', { timeout: 10000 });

    // 查找分隔符节点
    const delimiterNode = page.locator('.react-flow__node-delimiter').first();

    if (await delimiterNode.isVisible()) {
      // 点击节点打开侧边栏
      await delimiterNode.click();

      // 点击 "Add Task Node" 按钮
      const addButton = page.locator('button:has-text("Add Task Node")');
      await expect(addButton).toBeVisible();
      await addButton.click();

      // 等待对话框出现
      await page.waitForSelector('[data-testid="task-node-dialog"]', { timeout: 5000 });

      // 填写任务信息
      await page.locator('[data-testid="task-title-input"]').fill('测试任务');

      // 提交按钮 - 对话框内的"创建"按钮
      await page.locator('[data-testid="task-node-submit-btn"]').click();

      // 验证对话框关闭
      await expect(page.locator('[data-testid="task-node-dialog"]')).not.toBeVisible();

      // 验证新节点出现在画布上
      await expect(page.locator('[data-testid="task-node"]').filter({ hasText: '测试任务' })).toBeVisible();
    }
  });

  test('双击编辑时间线组标题', async ({ page }) => {
    // 先选中一个时间线组
    const group = page.locator('[data-swapy-item]').first();
    await group.click();

    // 等待 ReactFlow 加载
    await page.waitForSelector('.react-flow', { timeout: 10000 });

    // 双击标题进入编辑模式
    const heading = page.locator('h2.chakra-heading').first();
    await heading.dblclick();

    // 等待编辑输入框出现
    const input = page.locator('input[data-part="input"]').first();
    await expect(input).toBeVisible({ timeout: 3000 });

    // 修改标题
    const newTitle = '新标题 ' + Date.now();
    await input.fill(newTitle);

    // 提交
    await page.keyboard.press('Enter');

    // 验证标题已更新
    await expect(page.locator(`text=${newTitle}`).first()).toBeVisible();
  });

  test('同步功能', async ({ page }) => {
    // 点击同步按钮
    const syncButton = page.locator('button:has-text("Sync")');
    await syncButton.click();

    // 验证同步状态变为 syncing 或 success
    const badge = page.locator('.chakra-badge');
    await expect(badge).toHaveText(/syncing|success/, { timeout: 5000 });
  });

  test('拖拽重新排序时间线组', async ({ page }) => {
    const groups = page.locator('[data-swapy-item]');
    const count = await groups.count();

    if (count >= 2) {
      const firstGroup = groups.first();
      const secondGroup = groups.nth(1);

      const firstText = await firstGroup.textContent();
      const firstBox = await firstGroup.boundingBox();
      const secondBox = await secondGroup.boundingBox();

      if (firstBox && secondBox) {
        await page.mouse.move(firstBox.x + firstBox.width / 2, firstBox.y + firstBox.height / 2);
        await page.mouse.down();
        await page.waitForTimeout(800);
        await page.mouse.move(secondBox.x + secondBox.width / 2, secondBox.y + secondBox.height / 2, { steps: 20 });
        await page.waitForTimeout(200);
        await page.mouse.up();
        await page.waitForTimeout(500);

        const newFirstText = await groups.first().textContent();
        expect(newFirstText).not.toBe(firstText);
      }
    }
  });

  test('标记任务为完成', async ({ page }) => {
    const group = page.locator('[data-swapy-item]').first();
    await group.click();
    await page.waitForSelector('.react-flow', { timeout: 10000 });

    const taskNode = page.locator('[data-testid="task-node"][data-status="todo"]').first();

    if (await taskNode.isVisible()) {
      await taskNode.click();

      const completeButton = page.locator('button:has-text("Complete")');

      if (await completeButton.isVisible()) {
        const nodeId = await taskNode.getAttribute('data-id');
        await completeButton.click();

        const updatedNode = page.locator(`[data-testid="task-node"][data-id="${nodeId}"]`);
        await expect(updatedNode).toHaveAttribute('data-status', 'done', { timeout: 5000 });
      }
    }
  });

  test('空状态屏幕显示', async ({ page }) => {
    const groups = page.locator('[data-swapy-item]');
    const count = await groups.count();

    for (let i = 0; i < count; i++) {
      const group = groups.first();
      await group.locator('button[aria-label*="更多操作"]').click();
      await page.locator('div[role="menuitem"]:has-text("删除")').click();
      await page.waitForTimeout(300);
    }

    await expect(page.locator('text=尚未选择时间线组')).toBeVisible();
  });
});

test.describe('Timeline 初始无数据测试', () => {
  test('初始无数据显示空状态', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('text=One OK Todo', { timeout: 10000 });

    await expect(page.locator('text=尚未选择时间线组')).toBeVisible();
  });
});
