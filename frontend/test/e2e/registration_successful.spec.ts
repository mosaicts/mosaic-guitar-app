/**
 * E2E Tests - Complete Checkout Flow
 * Tests the full checkout process from cart to order confirmation
 */

import { expect } from '@playwright/test';
import { test } from './playwright.setup.js';
import { setupServer } from 'msw/node';
import { handlers } from './mocks/handlers';

const server = setupServer(...handlers);

test.beforeAll(() => {
  server.listen({ onUnhandledRequest: 'bypass' });
});

test.afterEach(() => {
  server.resetHandlers();
});

test.afterAll(() => {
  server.close();
});

test.describe('Successful Registration Flow', () => {
  test('should complete full registration flow: register → verify email → login', async ({
    page
  }) => {
    // Register
    await page.goto('/register');

    const firstNameInput = page.getByLabel('First name *');
    const lastNameInput = page.getByLabel('Last name *');
    const usernameInput = page.getByLabel('username *');
    const emailInput = page.getByLabel('Email *');
    const passwordInput = page.getByRole('textbox', { name: 'Password *', exact: true });
    const confirnPasswordInput = page.getByRole('textbox', { name: 'Confirm password *' });
    const registerBtn = page.getByRole('button', { name: 'Create account' });

    await firstNameInput.fill('test');
    await lastNameInput.fill('example');
    await usernameInput.fill('testexample');
    await emailInput.fill('test@example.com');
    await passwordInput.fill('password123');
    await confirnPasswordInput.fill('password123');
    await registerBtn.click();

    // Verify email
    await page.waitForURL('/check-your-email');
    expect(page.getByText('Please check your email for a verification link.')).toBeVisible();

    await page.goto('/verify-email?email=test@example.com&token=easytokenpass');
    await page.waitForTimeout(1500);
    expect(page.getByText('Email verified successfully')).toBeVisible();
    expect(
      page.getByText(
        'Click here to redirect to login page or redirect automatically within 10 seconds'
      )
    ).toBeVisible();
    // await page.getByRole('link', { name: 'here' }).click();
    await page.waitForTimeout(10000);
    expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();

    // Login
    const emailLoginInput = page.getByLabel('Email');
    const passwordLoginInput = page.getByLabel('Password');
    const loginBtn = page.getByRole('button', { name: 'Sign in' });

    await emailLoginInput.fill('test@example.com');
    await passwordLoginInput.fill('password123');
    await loginBtn.click();
    await page.waitForURL('/');

    expect(page.getByText('Featured Guitars')).toBeVisible();
  });
});
