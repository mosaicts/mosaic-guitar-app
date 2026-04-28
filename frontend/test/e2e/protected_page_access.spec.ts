/**
 * E2E Tests - Protected Page Access
 * Test that the app behaves correctly when accessing protected pages
 */

import { expect } from '@playwright/test';
import { test } from './playwright.setup.js';

// TODO
test.describe('Protected Page Access', () => {
  test('navigate to /login when accessing /profile page', async ({ page }) => {
    // Simulate logged in user
    await page.goto('/profile');
    await page.waitForTimeout(1000);
    expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
    expect(page.getByLabel('Email')).toBeVisible();
    expect(page.getByLabel('Password')).toBeVisible();
  });
});
