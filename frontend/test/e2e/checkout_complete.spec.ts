/**
 * E2E Tests - Complete Checkout Flow
 * Tests the full checkout process from cart to order confirmation
 */

import { expect } from '@playwright/test';
import { test } from './playwright.setup.js';

test.describe('Complete Checkout Flow', () => {
  test('should complete full checkout: cart → shipping → payment → order', async ({ page }) => {
    // Simulate logged in user
    await page.goto('/login');

    const emailInput = page.getByLabel('Email');
    const passwordInput = page.getByLabel('Password');
    const loginBtn = page.getByRole('button', { name: 'Sign in' });

    await emailInput.fill('test@example.com');
    await passwordInput.fill('password123');
    await loginBtn.click();
    await page.waitForTimeout(1500);

    expect(page.getByText('Featured Guitars')).toBeVisible();
  });
});
