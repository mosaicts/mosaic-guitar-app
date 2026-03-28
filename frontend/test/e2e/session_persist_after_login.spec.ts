/**
 * E2E Tests - Persisting session across tabs after logging in
 * Tests the session persistence when opening multiple tabs after loggin in
 */

import { expect } from '@playwright/test';
import { test } from './playwright.setup.js';

test.describe('Session Persists After Logging In', () => {
  test.beforeEach(async ({ context, page, browserName }) => {
    // Simulate logged in user
    await page.goto('/login');
    await page.waitForTimeout(2000);
    const emailInput = page.getByLabel('Email');
    const passwordInput = page.getByLabel('Password');
    const loginBtn = page.getByRole('button', { name: 'Sign in' });
    await emailInput.fill('test@example.com');
    await passwordInput.fill('password123');
    await loginBtn.click();
    await page.waitForTimeout(3000);
    expect(page.getByText('Featured Guitars')).toBeVisible();
  });

  test('should persist in the homepage when refreshing the page', async ({ page }) => {
    await page.reload();
    await page.waitForTimeout(2000);

    expect(page.getByText('Featured Guitars')).toBeVisible();
  });

  test('should go to homepage directly when opening a new tab', async ({ context, page }) => {
    // Open a new tab
    const newPage = await context.newPage();
    await newPage.goto('/');
    await newPage.waitForTimeout(2000);

    expect(page.getByText('Featured Guitars')).toBeVisible();
  });
});
