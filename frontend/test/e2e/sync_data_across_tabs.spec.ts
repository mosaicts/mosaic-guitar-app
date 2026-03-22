/**
 * E2E Tests - Complete Checkout Flow
 * Tests the full checkout process from cart to order confirmation
 */

import { expect, chromium } from '@playwright/test';
import { test } from './playwright.setup.js';
// import { test, expect } from './pages/setup';

test.describe('Sync User Data Across Tabs', () => {
  const username = 'testusr789';
  const firstName = 'Test';
  const lastName = 'User';
  const email = 'test@example.com';

  test.beforeEach(async ({ page }) => {
    const email = 'test@example.com';
    const password = 'password123';

    // Simulate logged in user
    await page.goto('/login');

    const emailInput = page.getByLabel('Email');
    const passwordInput = page.getByLabel('Password');
    const loginBtn = page.getByRole('button', { name: 'Sign in' });

    await emailInput.fill(email);
    await passwordInput.fill(password);
    await loginBtn.click();
    await page.waitForTimeout(1500);

    expect(page.getByText('Featured Guitars')).toBeVisible();
  });

  test('should update user data successfully', async ({ context, page }) => {
    // Go to profile page
    await page.goto('/profile');
    await page.waitForTimeout(3000);
    expect(page.getByRole('button', { name: 'TU' })).toBeVisible(); // avatar
    expect(page.getByText(`Username: ${username}`)).toBeVisible();
    expect(page.getByText(`First name: ${firstName}`)).toBeVisible();
    expect(page.getByText(`Last name: ${lastName}`)).toBeVisible();
    expect(page.getByText(`Email: ${email}`)).toBeVisible();

    const editBtn = page.getByRole('button', { name: 'Edit' });
    await editBtn.click();

    // Change first name
    const firstNameInput = page.getByRole('textbox', { name: 'First name:' });
    const newFirstName = 'nottest';
    await firstNameInput.fill(newFirstName);
    const submitBtn = page.getByRole('button', { name: 'Submit' });
    await submitBtn.click();

    expect(page.getByText(`First name: ${newFirstName}`)).toBeVisible();
    expect(page.getByRole('button', { name: 'NU' })).toBeVisible(); // avatar

    // Refresh the page
    await page.reload();
    await page.waitForTimeout(3000);
    expect(page.getByText(`First name: ${newFirstName}`)).toBeVisible();
    expect(page.getByRole('button', { name: 'NU' })).toBeVisible(); // avatar
  });

  test('should update user data when another tab updates the data', async ({ context, page }) => {
    await page.goto('http://localhost:5173/profile');
    await page.waitForTimeout(3000);

    expect(page.getByRole('button', { name: 'TU' })).toBeVisible(); // avatar
    expect(page.getByText(`Username: ${username}`)).toBeVisible();
    expect(page.getByText(`First name: ${firstName}`)).toBeVisible();
    expect(page.getByText(`Last name: ${lastName}`)).toBeVisible();
    expect(page.getByText(`Email: ${email}`)).toBeVisible();

    // await page.getByRole('button', { name: 'Edit' }).click();

    // Create a new page inside context.
    const newPage = await context.newPage();
    const url = 'http://localhost:5173';
    await context.addCookies([
      { name: '__User-Fgp', value: 'fgp', url },
      { name: '__Refresh-Token', value: 'refreshtoken', url }
    ]);
    await newPage.goto('http://localhost:5173/profile');
    await newPage.waitForTimeout(3000);

    expect(newPage.getByRole('button', { name: 'TU' })).toBeVisible(); // avatar
    expect(newPage.getByText(`Username: ${username}`)).toBeVisible();
    expect(newPage.getByText(`First name: ${firstName}`)).toBeVisible();
    expect(newPage.getByText(`Last name: ${lastName}`)).toBeVisible();
    expect(newPage.getByText(`Email: ${email}`)).toBeVisible();

    // // Change first name
    const newFirstName = 'nottest';
    await newPage.getByRole('button', { name: 'Edit' }).click();
    const firstNameInput = newPage.getByRole('textbox', { name: 'First name:' });
    await firstNameInput.fill(newFirstName);
    const submitBtn = newPage.getByRole('button', { name: 'Submit' });
    await submitBtn.click();

    expect(newPage.getByText(`First name: ${newFirstName}`)).toBeVisible();
    expect(newPage.getByRole('button', { name: 'NU' })).toBeVisible(); // avatar

    // Get pages of a browser context
    const allTabs = context.pages();
    console.log(allTabs.length);

    page = allTabs[0];
    await page.bringToFront();
    // await page.getByRole('button', { name: 'Cancel' }).click();
    expect(page.getByText(`First name: ${newFirstName}`)).toBeVisible();
    expect(page.getByRole('button', { name: 'NU' })).toBeVisible(); // avatar
  });
});
