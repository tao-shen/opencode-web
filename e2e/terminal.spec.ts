import { test, expect } from '@playwright/test';

test.describe('OpenCode Terminal', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://opencode-web-pearl.vercel.app/terminal');
  });

  test('terminal page loads successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/Terminal/);
    
    const terminal = page.locator('.xterm');
    await expect(terminal).toBeVisible({ timeout: 10000 });
  });

  test('no console errors on load', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.waitForLoadState('networkidle');
    
    expect(errors).toHaveLength(0);
  });

  test('connection status indicator exists', async ({ page }) => {
    const status = page.locator('text=/connected|connecting|error/i');
    await expect(status).toBeVisible({ timeout: 5000 });
  });

  test('terminal is interactive', async ({ page }) => {
    const terminal = page.locator('.xterm-viewport');
    await expect(terminal).toBeVisible();
    
    await terminal.click();
    
    await page.keyboard.type('echo "Hello World"');
    
    await page.waitForTimeout(1000);
  });
});

test.describe('OpenCode Home Page', () => {
  test('home page loads', async ({ page }) => {
    await page.goto('https://opencode-web-pearl.vercel.app/');
    
    await expect(page).toHaveTitle(/OpenCode/);
  });

  test('navigation to terminal works', async ({ page }) => {
    await page.goto('https://opencode-web-pearl.vercel.app/');
    
    const terminalLink = page.locator('a[href*="terminal"]');
    await expect(terminalLink).toBeVisible();
    
    await terminalLink.click();
    
    await expect(page).toHaveURL(/terminal/);
  });
});
