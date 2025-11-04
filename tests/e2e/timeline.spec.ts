import { test, expect } from '@playwright/test';

test.describe('Timeline功能 E2E测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // 等待应用加载完成
    await page.waitForSelector('text=One OK Todo', { timeout: 10000 });
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
    // 点击"新建"按钮创建时间线组
    await page.locator('button:has-text("新建")').click();
    
    // 等待对话框打开
    await expect(page.locator('text=创建分组')).toBeVisible();
    
    // 输入分组名称
    const groupName = '测试分组 ' + Date.now();
    await page.locator('input[placeholder*="分组名称"]').fill(groupName);
    
    // 点击保存按钮
    await page.locator('button:has-text("保存")').click();
    
    // 验证新分组出现在列表中
    await expect(page.locator(`text=${groupName}`)).toBeVisible();
  });

  test('编辑时间线组名称', async ({ page }) => {
    // 等待有时间线组存在
    const firstGroup = page.locator('[data-swapy-item]').first();
    await expect(firstGroup).toBeVisible();
    
    // 点击编辑按钮
    await firstGroup.locator('button[aria-label*="编辑"]').click();
    
    // 等待对话框打开
    await expect(page.locator('text=编辑分组')).toBeVisible();
    
    // 修改分组名称
    const newName = '修改后的分组 ' + Date.now();
    const input = page.locator('input[placeholder*="分组名称"]');
    await input.clear();
    await input.fill(newName);
    
    // 保存更改
    await page.locator('button:has-text("保存")').click();
    
    // 验证名称已更新
    await expect(page.locator(`text=${newName}`)).toBeVisible();
  });

  test('删除时间线组', async ({ page }) => {
    // 创建一个新分组用于删除
    await page.locator('button:has-text("新建")').click();
    await expect(page.locator('text=创建分组')).toBeVisible();
    
    const groupName = '待删除分组 ' + Date.now();
    await page.locator('input[placeholder*="分组名称"]').fill(groupName);
    await page.locator('button:has-text("保存")').click();
    await expect(page.locator(`text=${groupName}`)).toBeVisible();
    
    // 找到该分组并点击删除按钮
    const group = page.locator(`text=${groupName}`).locator('..').locator('..');
    await group.locator('button[aria-label*="删除"]').click();
    
    // 确认删除
    await page.locator('button:has-text("删除")').click();
    
    // 验证分组已被删除
    await expect(page.locator(`text=${groupName}`)).not.toBeVisible();
  });

  test('切换选中的时间线组', async ({ page }) => {
    // 获取所有时间线组
    const groups = page.locator('[data-swapy-item]');
    const count = await groups.count();
    
    if (count >= 2) {
      // 点击第二个分组
      await groups.nth(1).click();
      
      // 验证选中状态变化（通过样式或其他视觉指示器）
      await expect(groups.nth(1)).toHaveAttribute('aria-selected', 'true');
    }
  });

  test('在时间线组内创建新时间线', async ({ page }) => {
    // 确保有选中的时间线组
    const group = page.locator('[data-swapy-item]').first();
    await group.click();
    
    // 找到并点击"添加时间线"按钮
    await page.locator('button:has-text("添加时间线")').click();
    
    // 等待对话框出现
    await expect(page.locator('text=创建时间线')).toBeVisible();
    
    // 输入时间线标题
    const timelineName = '测试时间线 ' + Date.now();
    await page.locator('input[placeholder*="时间线"]').fill(timelineName);
    
    // 选择时间线类型（任务时间线）
    await page.locator('label:has-text("任务时间线")').click();
    
    // 保存
    await page.locator('button:has-text("创建")').click();
    
    // 验证时间线出现在视图中
    await expect(page.locator(`text=${timelineName}`)).toBeVisible();
  });

  test('创建任务节点', async ({ page }) => {
    // 等待ReactFlow加载完成
    await page.waitForSelector('.react-flow', { timeout: 10000 });
    
    // 查找开始分隔符节点
    const startNode = page.locator('[data-id*="delimiter"]').first();
    
    if (await startNode.isVisible()) {
      // 右键点击节点
      await startNode.click({ button: 'right' });
      
      // 或者查找添加任务按钮
      const addButton = page.locator('button:has-text("添加任务")');
      if (await addButton.isVisible()) {
        await addButton.click();
        
        // 填写任务信息
        await page.locator('input[placeholder*="任务标题"]').fill('测试任务');
        await page.locator('button:has-text("创建")').click();
        
        // 验证任务节点已创建
        await expect(page.locator('text=测试任务')).toBeVisible();
      }
    }
  });

  test('标记任务为完成', async ({ page }) => {
    // 等待ReactFlow加载
    await page.waitForSelector('.react-flow');
    
    // 查找任务节点
    const taskNode = page.locator('[data-nodetype="task"]').first();
    
    if (await taskNode.isVisible()) {
      // 点击任务节点
      await taskNode.click();
      
      // 在右侧面板中找到"完成"按钮
      const completeButton = page.locator('button:has-text("完成")');
      
      if (await completeButton.isVisible()) {
        await completeButton.click();
        
        // 验证任务状态变化（可能通过样式类或文本变化）
        await expect(taskNode).toHaveClass(/done/);
      }
    }
  });

  test('双击编辑时间线组标题', async ({ page }) => {
    // 等待时间线组标题加载
    const title = page.locator('h2').first();
    await expect(title).toBeVisible();
    
    // 双击标题进入编辑模式
    await title.dblclick();
    
    // 验证输入框出现
    const input = page.locator('input[type="text"]').first();
    await expect(input).toBeVisible();
    
    // 修改标题
    const newTitle = '新标题 ' + Date.now();
    await input.fill(newTitle);
    
    // 点击提交按钮
    await page.locator('button[aria-label*="Submit"]').click();
    
    // 验证标题已更新
    await expect(page.locator(`text=${newTitle}`)).toBeVisible();
  });

  test('拖拽重新排序时间线组', async ({ page }) => {
    // 获取时间线组列表
    const groups = page.locator('[data-swapy-item]');
    const count = await groups.count();
    
    if (count >= 2) {
      // 获取第一个和第二个分组的初始位置
      const firstGroup = groups.first();
      const secondGroup = groups.nth(1);
      
      const firstText = await firstGroup.textContent();
      
      // 执行拖拽操作
      await firstGroup.dragTo(secondGroup);
      
      // 等待重新排序完成
      await page.waitForTimeout(500);
      
      // 验证顺序已改变
      const newFirstText = await groups.first().textContent();
      expect(newFirstText).not.toBe(firstText);
    }
  });

  test('同步功能', async ({ page }) => {
    // 点击同步按钮
    const syncButton = page.locator('button:has-text("Sync")');
    await syncButton.click();
    
    // 验证同步状态变化
    await expect(page.locator('text=syncing')).toBeVisible();
    
    // 等待同步完成
    await expect(page.locator('text=success')).toBeVisible({ timeout: 5000 });
    
    // 等待状态自动重置
    await page.waitForTimeout(2500);
    await expect(page.locator('text=idle')).toBeVisible();
  });

  test('空状态屏幕显示', async ({ page }) => {
    // 删除所有时间线组
    while (await page.locator('[data-swapy-item]').count() > 0) {
      const group = page.locator('[data-swapy-item]').first();
      await group.locator('button[aria-label*="删除"]').click();
      await page.locator('button:has-text("删除")').click();
      await page.waitForTimeout(500);
    }
    
    // 验证空状态屏幕显示
    await expect(page.locator('text=暂无时间线组')).toBeVisible();
  });
});
