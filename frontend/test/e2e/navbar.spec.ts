/**
 * E2E Tests - Navbar behaviors
 * Test the navbar behaviors
 */

import { expect, devices } from '@playwright/test';
import { test } from './playwright.setup.js';

test.describe('Navbar', () => {
  // test.use({ viewport: { width: 1920, height: 1080 } });

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

  test('should render the navbar and no menu btn in desktop view then when resizing to mobile view the navbar disappears', async ({
    page
  }) => {
    expect(page.getByText('Featured Guitars')).toBeVisible();
    expect(page.getByRole('button', { name: 'menu' })).not.toBeVisible();
    expect(page.getByRole('link', { name: 'home Home' })).toBeVisible();
    expect(page.getByRole('link', { name: 'orders Orders' })).toBeVisible();

    await page.setViewportSize(devices['iPhone X'].viewport);
    expect(page.getByRole('menu')).not.toBeVisible();
    expect(page.getByRole('link', { name: 'home Home' })).not.toBeVisible();
    expect(page.getByRole('link', { name: 'orders Orders' })).not.toBeVisible();

    // undo
    // await page.setViewportSize({ width: 1920, height: 1080 }); // resize to desktop viewport
  });

  test('should be able to toggle the navbar - mobile view', async ({ page }) => {
    await page.setViewportSize(devices['iPhone X'].viewport);
    expect(page.getByText('Featured Guitars')).toBeVisible();

    expect(page.getByRole('button', { name: 'menu' })).toBeVisible();
    await page.getByRole('button', { name: 'menu' }).click();
    expect(page.getByRole('menu')).toHaveClass('slide-in');

    // click again
    await page.getByRole('button', { name: 'menu' }).click();
    expect(page.getByRole('menu')).toHaveClass('slide-out');

    // undo
    // await page.setViewportSize({ width: 1920, height: 1080 }); // resize to desktop view
  });

  test('should display the navbar open after opening the navbar in mobile view then resizing to desktop view and finally resizing to mobile view again', async ({
    page
  }) => {
    await page.setViewportSize(devices['iPhone X'].viewport);
    await page.waitForTimeout(1000);
    expect(page.getByRole('button', { name: 'menu' })).toBeVisible();
    await page.getByRole('button', { name: 'menu' }).click();
    expect(page.getByRole('menu')).toHaveClass('slide-in');

    await page.setViewportSize({ width: 1920, height: 1080 }); // resize to desktop view
    expect(page.getByRole('link', { name: 'home Home' })).toBeVisible();
    expect(page.getByRole('link', { name: 'orders Orders' })).toBeVisible();

    await page.setViewportSize(devices['iPhone X'].viewport);
    expect(page.getByRole('menu')).toBeVisible();
    expect(page.getByRole('link', { name: 'home Home' })).toBeVisible();
    expect(page.getByRole('link', { name: 'orders Orders' })).toBeVisible();

    // undo
    // await page.setViewportSize({ width: 1920, height: 1080 }); // resize to desktop view
  });

  test('should not display the navbar open after closing the navbar in mobile view then resizing to desktop view and finally resizing to mobile view again', async ({
    page
  }) => {
    await page.setViewportSize(devices['iPhone X'].viewport);
    await page.waitForTimeout(1000);
    expect(page.getByRole('button', { name: 'menu' })).toBeVisible();
    await page.getByRole('button', { name: 'menu' }).click();
    expect(page.getByRole('menu')).toHaveClass('slide-in');
    await page.getByRole('button', { name: 'menu' }).click();
    expect(page.getByRole('menu')).toHaveClass('slide-out');

    await page.setViewportSize({ width: 1920, height: 1080 }); // resize to desktop view
    expect(page.getByRole('link', { name: 'home Home' })).toBeVisible();
    expect(page.getByRole('link', { name: 'orders Orders' })).toBeVisible();

    await page.setViewportSize(devices['iPhone X'].viewport);
    await page.waitForTimeout(1000);
    expect(page.getByRole('menu')).not.toBeVisible();
    expect(page.getByRole('link', { name: 'home Home' })).not.toBeVisible();
    expect(page.getByRole('link', { name: 'orders Orders' })).not.toBeVisible();

    // undo
    // await page.setViewportSize({ width: 1920, height: 1080 }); // resize to desktop view
  });
});
