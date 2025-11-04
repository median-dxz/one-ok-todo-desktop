import { test, expect } from '@playwright/test';

test.describe('Memo功能 E2E测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // 切换到Memo视图
    await page.locator('button:has-text("Memo")').click();
    
    // 等待Memo界面加载
    await page.waitForSelector('text=Add Root Item', { timeout: 5000 });
  });

  test('Memo视图初始化', async ({ page }) => {
    // 验证Memo视图已激活
    await expect(page.locator('button[aria-label="Memo View"]')).toHaveAttribute('aria-selected', 'true');
    
    // 验证搜索框存在
    await expect(page.locator('input[placeholder*="Search"]')).toBeVisible();
    
    // 验证"Add Root Item"按钮存在
    await expect(page.locator('button:has-text("Add Root Item")')).toBeVisible();
  });

  test('添加根节点 - 字符串类型', async ({ page }) => {
    // 点击"Add Root Item"按钮
    await page.locator('button:has-text("Add Root Item")').click();
    
    // 等待类型选择对话框
    await expect(page.locator('text=选择节点类型')).toBeVisible();
    
    // 选择字符串类型
    await page.locator('button:has-text("String")').click();
    
    // 填写键名
    await page.locator('input[placeholder*="键名"]').fill('testKey');
    
    // 填写值
    await page.locator('input[placeholder*="值"]').fill('testValue');
    
    // 保存
    await page.locator('button:has-text("添加")').click();
    
    // 验证节点已添加
    await expect(page.locator('text=testKey')).toBeVisible();
    await expect(page.locator('text=testValue')).toBeVisible();
  });

  test('添加根节点 - 数字类型', async ({ page }) => {
    await page.locator('button:has-text("Add Root Item")').click();
    await expect(page.locator('text=选择节点类型')).toBeVisible();
    
    // 选择数字类型
    await page.locator('button:has-text("Number")').click();
    
    await page.locator('input[placeholder*="键名"]').fill('count');
    await page.locator('input[type="number"]').fill('42');
    await page.locator('button:has-text("添加")').click();
    
    // 验证节点已添加
    await expect(page.locator('text=count')).toBeVisible();
    await expect(page.locator('text=42')).toBeVisible();
  });

  test('添加根节点 - 布尔类型', async ({ page }) => {
    await page.locator('button:has-text("Add Root Item")').click();
    await expect(page.locator('text=选择节点类型')).toBeVisible();
    
    // 选择布尔类型
    await page.locator('button:has-text("Boolean")').click();
    
    await page.locator('input[placeholder*="键名"]').fill('enabled');
    
    // 选择true
    await page.locator('label:has-text("True")').click();
    await page.locator('button:has-text("添加")').click();
    
    // 验证节点已添加
    await expect(page.locator('text=enabled')).toBeVisible();
    await expect(page.locator('text=true')).toBeVisible();
  });

  test('添加根节点 - 对象类型', async ({ page }) => {
    await page.locator('button:has-text("Add Root Item")').click();
    await expect(page.locator('text=选择节点类型')).toBeVisible();
    
    // 选择对象类型
    await page.locator('button:has-text("Object")').click();
    
    await page.locator('input[placeholder*="键名"]').fill('config');
    await page.locator('button:has-text("添加")').click();
    
    // 验证对象节点已添加
    await expect(page.locator('text=config')).toBeVisible();
    await expect(page.locator('text={}')).toBeVisible();
  });

  test('添加根节点 - 数组类型', async ({ page }) => {
    await page.locator('button:has-text("Add Root Item")').click();
    await expect(page.locator('text=选择节点类型')).toBeVisible();
    
    // 选择数组类型
    await page.locator('button:has-text("Array")').click();
    
    await page.locator('input[placeholder*="键名"]').fill('items');
    await page.locator('button:has-text("添加")').click();
    
    // 验证数组节点已添加
    await expect(page.locator('text=items')).toBeVisible();
    await expect(page.locator('text=[]')).toBeVisible();
  });

  test('添加子节点', async ({ page }) => {
    // 先创建一个对象类型的根节点
    await page.locator('button:has-text("Add Root Item")').click();
    await page.locator('button:has-text("Object")').click();
    await page.locator('input[placeholder*="键名"]').fill('parent');
    await page.locator('button:has-text("添加")').click();
    
    // 找到该节点的"添加子节点"按钮
    const parentNode = page.locator('text=parent').locator('..');
    await parentNode.locator('button[aria-label*="添加子节点"]').click();
    
    // 添加字符串子节点
    await page.locator('button:has-text("String")').click();
    await page.locator('input[placeholder*="键名"]').fill('child');
    await page.locator('input[placeholder*="值"]').fill('childValue');
    await page.locator('button:has-text("添加")').click();
    
    // 验证子节点已添加
    await expect(page.locator('text=child')).toBeVisible();
    await expect(page.locator('text=childValue')).toBeVisible();
  });

  test('编辑节点值', async ({ page }) => {
    // 先创建一个字符串节点
    await page.locator('button:has-text("Add Root Item")').click();
    await page.locator('button:has-text("String")').click();
    await page.locator('input[placeholder*="键名"]').fill('editTest');
    await page.locator('input[placeholder*="值"]').fill('originalValue');
    await page.locator('button:has-text("添加")').click();
    
    // 找到该节点的编辑按钮
    const node = page.locator('text=editTest').locator('..');
    await node.locator('button[aria-label*="编辑"]').click();
    
    // 修改值
    const input = page.locator('input[value="originalValue"]');
    await input.clear();
    await input.fill('newValue');
    
    // 保存
    await page.locator('button:has-text("保存")').click();
    
    // 验证值已更新
    await expect(page.locator('text=newValue')).toBeVisible();
    await expect(page.locator('text=originalValue')).not.toBeVisible();
  });

  test('删除节点', async ({ page }) => {
    // 先创建一个节点
    await page.locator('button:has-text("Add Root Item")').click();
    await page.locator('button:has-text("String")').click();
    await page.locator('input[placeholder*="键名"]').fill('deleteTest');
    await page.locator('input[placeholder*="值"]').fill('toDelete');
    await page.locator('button:has-text("添加")').click();
    
    await expect(page.locator('text=deleteTest')).toBeVisible();
    
    // 找到并点击删除按钮
    const node = page.locator('text=deleteTest').locator('..');
    await node.locator('button[aria-label*="删除"]').click();
    
    // 确认删除
    await page.locator('button:has-text("确认")').click();
    
    // 验证节点已删除
    await expect(page.locator('text=deleteTest')).not.toBeVisible();
  });

  test('切换节点类型 - 从字符串到数字', async ({ page }) => {
    // 创建字符串节点
    await page.locator('button:has-text("Add Root Item")').click();
    await page.locator('button:has-text("String")').click();
    await page.locator('input[placeholder*="键名"]').fill('convertTest');
    await page.locator('input[placeholder*="值"]').fill('123');
    await page.locator('button:has-text("添加")').click();
    
    // 找到切换类型按钮
    const node = page.locator('text=convertTest').locator('..');
    await node.locator('button[aria-label*="切换类型"]').click();
    
    // 选择数字类型
    await page.locator('button:has-text("Number")').click();
    
    // 验证类型已切换
    await expect(page.locator('input[type="number"][value="123"]')).toBeVisible();
  });

  test('展开/折叠对象节点', async ({ page }) => {
    // 创建对象节点并添加子节点
    await page.locator('button:has-text("Add Root Item")').click();
    await page.locator('button:has-text("Object")').click();
    await page.locator('input[placeholder*="键名"]').fill('collapsible');
    await page.locator('button:has-text("添加")').click();
    
    // 添加子节点
    const parentNode = page.locator('text=collapsible').locator('..');
    await parentNode.locator('button[aria-label*="添加子节点"]').click();
    await page.locator('button:has-text("String")').click();
    await page.locator('input[placeholder*="键名"]').fill('child');
    await page.locator('input[placeholder*="值"]').fill('value');
    await page.locator('button:has-text("添加")').click();
    
    // 验证子节点可见
    await expect(page.locator('text=child')).toBeVisible();
    
    // 点击折叠按钮
    await parentNode.locator('button[aria-label*="折叠"]').click();
    
    // 验证子节点隐藏
    await expect(page.locator('text=child')).not.toBeVisible();
    
    // 再次点击展开
    await parentNode.locator('button[aria-label*="展开"]').click();
    
    // 验证子节点重新可见
    await expect(page.locator('text=child')).toBeVisible();
  });

  test('数组节点添加元素', async ({ page }) => {
    // 创建数组节点
    await page.locator('button:has-text("Add Root Item")').click();
    await page.locator('button:has-text("Array")').click();
    await page.locator('input[placeholder*="键名"]').fill('arrayTest');
    await page.locator('button:has-text("添加")').click();
    
    // 添加数组元素
    const arrayNode = page.locator('text=arrayTest').locator('..');
    await arrayNode.locator('button[aria-label*="添加元素"]').click();
    
    await page.locator('button:has-text("String")').click();
    await page.locator('input[placeholder*="值"]').fill('element1');
    await page.locator('button:has-text("添加")').click();
    
    // 验证元素已添加
    await expect(page.locator('text=element1')).toBeVisible();
  });

  test('移动节点位置（上移）', async ({ page }) => {
    // 创建两个节点
    await page.locator('button:has-text("Add Root Item")').click();
    await page.locator('button:has-text("String")').click();
    await page.locator('input[placeholder*="键名"]').fill('first');
    await page.locator('input[placeholder*="值"]').fill('1');
    await page.locator('button:has-text("添加")').click();
    
    await page.locator('button:has-text("Add Root Item")').click();
    await page.locator('button:has-text("String")').click();
    await page.locator('input[placeholder*="键名"]').fill('second');
    await page.locator('input[placeholder*="值"]').fill('2');
    await page.locator('button:has-text("添加")').click();
    
    // 获取第二个节点并点击上移按钮
    const nodes = page.locator('[data-memo-node]');
    const secondNode = nodes.nth(1);
    await secondNode.locator('button[aria-label*="上移"]').click();
    
    // 验证顺序已改变
    const firstNodeAfter = nodes.first();
    await expect(firstNodeAfter).toContainText('second');
  });

  test('搜索节点', async ({ page }) => {
    // 创建几个节点
    await page.locator('button:has-text("Add Root Item")').click();
    await page.locator('button:has-text("String")').click();
    await page.locator('input[placeholder*="键名"]').fill('searchable');
    await page.locator('input[placeholder*="值"]').fill('findMe');
    await page.locator('button:has-text("添加")').click();
    
    await page.locator('button:has-text("Add Root Item")').click();
    await page.locator('button:has-text("String")').click();
    await page.locator('input[placeholder*="键名"]').fill('other');
    await page.locator('input[placeholder*="值"]').fill('ignore');
    await page.locator('button:has-text("添加")').click();
    
    // 使用搜索框
    await page.locator('input[placeholder*="Search"]').fill('searchable');
    
    // 验证搜索结果
    await expect(page.locator('text=searchable')).toBeVisible();
    await expect(page.locator('text=other')).not.toBeVisible();
  });

  test('复制节点（如果实现）', async ({ page }) => {
    // 创建节点
    await page.locator('button:has-text("Add Root Item")').click();
    await page.locator('button:has-text("String")').click();
    await page.locator('input[placeholder*="键名"]').fill('toCopy');
    await page.locator('input[placeholder*="值"]').fill('copyValue');
    await page.locator('button:has-text("添加")').click();
    
    // 查找复制按钮（如果存在）
    const node = page.locator('text=toCopy').locator('..');
    const copyButton = node.locator('button[aria-label*="复制"]');
    
    if (await copyButton.isVisible()) {
      await copyButton.click();
      
      // 验证复制的节点出现
      const copyNodes = page.locator('text=toCopy');
      await expect(copyNodes).toHaveCount(2);
    }
  });

  test('导出YAML（如果实现）', async ({ page }) => {
    // 创建一些节点
    await page.locator('button:has-text("Add Root Item")').click();
    await page.locator('button:has-text("Object")').click();
    await page.locator('input[placeholder*="键名"]').fill('export');
    await page.locator('button:has-text("添加")').click();
    
    // 查找导出按钮（如果存在）
    const exportButton = page.locator('button:has-text("导出")');
    
    if (await exportButton.isVisible()) {
      const downloadPromise = page.waitForEvent('download');
      await exportButton.click();
      const download = await downloadPromise;
      
      // 验证文件名
      expect(download.suggestedFilename()).toContain('.yaml');
    }
  });
});
