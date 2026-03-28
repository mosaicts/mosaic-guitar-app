/**
 * E2E Tests - Syncing data across tabs
 * Tests the data when opening multiple tabs
 */

import { expect } from '@playwright/test';
import { test } from './playwright.setup.js';

test.describe('Syncing Data Across Tabs', () => {
  const username = 'testusr789';
  const firstName = 'Test';
  const lastName = 'User';
  const email = 'test@example.com';

  const domain = 'localhost';
  const path = '/auth';
  const cookieAttrs = { domain, path };

  test.beforeEach(async ({ context, page, browserName }) => {
    // TODO: solve to not skip for webkit
    test.skip(
      browserName === 'webkit',
      'Webkit prevents cross-site tracking, hence cannot send cookies' // https://github.com/microsoft/playwright/issues/17368
    );

    // simulate logged in user
    await context.addCookies([
      { name: 'userFingerprint', value: 'test-fgp', ...cookieAttrs },
      { name: 'refreshToken', value: 'test-token', ...cookieAttrs }
    ]);
  });

  test('should update user data successfully', async ({ context, page }) => {
    // Go to profile page
    await page.goto('/profile');
    await page.waitForTimeout(2000);
    expect(page.getByRole('button', { name: 'TU' })).toBeVisible(); // avatar
    expect(page.getByText(`Username: ${username}`)).toBeVisible();
    expect(page.getByText(`First name: ${firstName}`)).toBeVisible();
    expect(page.getByText(`Last name: ${lastName}`)).toBeVisible();
    expect(page.getByText(`Email: ${email}`)).toBeVisible();
    await page.getByRole('button', { name: 'Edit' }).click();

    // Change first name
    let firstNameInput = page.getByRole('textbox', { name: 'First name:' });
    let newFirstName = 'notest';
    await firstNameInput.fill(newFirstName);
    await page.getByRole('button', { name: 'Submit' }).click();

    expect(page.getByText(`First name: ${newFirstName}`)).toBeVisible();
    expect(page.getByRole('button', { name: 'NU' })).toBeVisible(); // avatar

    // Refresh the page still keeps the latest data
    await page.reload();
    await page.waitForTimeout(2000);
    expect(page.getByText(`First name: ${newFirstName}`)).toBeVisible();
    expect(page.getByRole('button', { name: 'NU' })).toBeVisible(); // avatar

    // Undo the update
    await page.getByRole('button', { name: 'Edit' }).click();

    firstNameInput = page.getByRole('textbox', { name: 'First name:' });
    newFirstName = 'Test';
    await firstNameInput.fill(newFirstName);
    await page.getByRole('button', { name: 'Submit' }).click();

    expect(page.getByText(`First name: ${newFirstName}`)).toBeVisible();
    expect(page.getByRole('button', { name: 'TU' })).toBeVisible(); // avatar
  });

  test('should update user data when another tab updates the data', async ({ context, page }) => {
    await page.goto('/profile');
    await page.waitForTimeout(2000);

    expect(page.getByRole('button', { name: 'TU' })).toBeVisible(); // avatar
    expect(page.getByText(`Username: ${username}`)).toBeVisible();
    expect(page.getByText(`First name: ${firstName}`)).toBeVisible();
    expect(page.getByText(`Last name: ${lastName}`)).toBeVisible();
    expect(page.getByText(`Email: ${email}`)).toBeVisible();

    // uncomment if we want to differentiate between the 2 tabs
    // await page.getByRole('button', { name: 'Edit' }).click();

    // Create a new page inside context.
    const newPage = await context.newPage();
    await newPage.goto('/profile');
    await newPage.waitForTimeout(2000);

    expect(newPage.getByRole('button', { name: 'TU' })).toBeVisible(); // avatar
    expect(newPage.getByText(`Username: ${username}`)).toBeVisible();
    expect(newPage.getByText(`First name: ${firstName}`)).toBeVisible();
    expect(newPage.getByText(`Last name: ${lastName}`)).toBeVisible();
    expect(newPage.getByText(`Email: ${email}`)).toBeVisible();
    await newPage.getByRole('button', { name: 'Edit' }).click();

    // // Change first name
    let newFirstName = 'notest';
    let firstNameInput = newPage.getByRole('textbox', { name: 'First name:' });
    await firstNameInput.fill(newFirstName);
    await newPage.getByRole('button', { name: 'Submit' }).click();
    await newPage.waitForTimeout(1000);

    expect(newPage.getByText(`First name: ${newFirstName}`)).toBeVisible();
    expect(newPage.getByRole('button', { name: 'NU' })).toBeVisible(); // avatar

    // Get pages of a browser context
    const allTabs = context.pages();
    page = allTabs[0];
    await page.bringToFront();
    // await page.getByRole('button', { name: 'Cancel' }).click();
    expect(page.getByText(`First name: ${newFirstName}`)).toBeVisible();
    expect(page.getByRole('button', { name: 'NU' })).toBeVisible(); // avatar

    // Undo the update
    await page.getByRole('button', { name: 'Edit' }).click();

    newFirstName = 'Test';
    firstNameInput = page.getByRole('textbox', { name: 'First name:' });
    await firstNameInput.fill(newFirstName);
    await page.getByRole('button', { name: 'Submit' }).click();

    expect(page.getByText(`First name: ${newFirstName}`)).toBeVisible();
    expect(page.getByRole('button', { name: 'TU' })).toBeVisible(); // avatar
  });

  test('should have the latest jwt synced across tabs when a tab refreshes and get new cookies', async ({
    context,
    page
  }) => {
    await page.goto('/profile');
    await page.waitForTimeout(2000);
    let storage = await page.evaluate(() => window.sessionStorage);
    expect(storage.jwt).toEqual('test.jwt');

    // Create a new page inside context.
    const newPage = await context.newPage();
    await newPage.goto('/profile');
    await newPage.waitForTimeout(2000);

    // Refresh the tab
    await page.reload();
    await page.waitForTimeout(2000);

    storage = await newPage.evaluate(() => window.sessionStorage);
    expect(storage.jwt).toEqual('test.newjwt');

    // Grab the first tab
    const allTabs = context.pages();
    page = allTabs[0];
    await page.bringToFront();
    storage = await page.evaluate(() => window.sessionStorage);
    expect(storage.jwt).toEqual('test.newjwt');
  });

  test('should have the latest jwt synced across tabs when a new tab opens and get new cookies', async ({
    context,
    page
  }) => {
    await page.goto('/profile');
    await page.waitForTimeout(2000);
    let storage = await page.evaluate(() => window.sessionStorage);
    expect(storage.jwt).toEqual('test.jwt');

    // Open a new tab
    const newPage = await context.newPage();
    await newPage.goto('/profile');
    await newPage.waitForTimeout(2000);

    storage = await newPage.evaluate(() => window.sessionStorage);
    expect(storage.jwt).toEqual('test.newjwt');

    // Grab the first tab
    const allTabs = context.pages();
    page = allTabs[0];
    await page.bringToFront();
    storage = await page.evaluate(() => window.sessionStorage);
    expect(storage.jwt).toEqual('test.newjwt');
  });

  test('should logout in all tabs when user logouts in a tab', async ({ context, page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);
    let storage = await page.evaluate(() => window.sessionStorage);
    expect(storage.jwt).toEqual('test.jwt');

    // Open a new tab
    const newPage = await context.newPage();
    await newPage.goto('/');
    await newPage.waitForTimeout(2000);

    await newPage.getByRole('button', { name: 'TU' }).click();
    await newPage.getByRole('link', { name: 'Sign out' }).click();

    await page.waitForURL('/login');
    expect(newPage.getByRole('heading', { name: 'Sign in' })).toBeVisible();
    storage = await newPage.evaluate(() => window.sessionStorage);
    expect(storage.jwt).toEqual(undefined);

    // Grab the first tab
    const allTabs = context.pages();
    page = allTabs[0];
    await page.bringToFront();
    expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();

    // Refreshing
    await page.reload();
    await page.waitForTimeout(2000);
    expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
  });
});
