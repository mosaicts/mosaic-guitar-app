/**
 * E2E Tests - Complete Checkout Flow
 * Tests the full checkout process from cart to order confirmation
 */

import { expect } from '@playwright/test';
import { test } from './playwright.setup.js';
import { MOSAIC_BASE_URL } from './mocks/handlers.js';
import type { Locator } from '@playwright/test';

async function pasteText(locator: Locator, text: string) {
  await locator.click();
  await locator.page().evaluate((t) => navigator.clipboard.writeText(t), text);
  await locator.page().keyboard.press('ControlOrMeta+V');
}

test.describe('Successful Authentication Flow', () => {
  test.describe('Registration', () => {
    test.beforeEach(async ({ page }) => {
      // Signup
      await page.goto('/signup');

      const firstNameInput = page.getByLabel('First name *');
      const lastNameInput = page.getByLabel('Last name *');
      const usernameInput = page.getByLabel('username *');
      const emailInput = page.getByLabel('Email *');
      const passwordInput = page.getByRole('textbox', { name: 'Password *', exact: true });
      const confirnPasswordInput = page.getByRole('textbox', { name: 'Confirm password *' });
      const signupBtn = page.getByRole('button', { name: 'Create account' });

      await firstNameInput.fill('test');
      await lastNameInput.fill('example');
      await usernameInput.fill('testexample');
      await emailInput.fill('test@example.com');
      await passwordInput.fill('password123');
      await confirnPasswordInput.fill('password123');
      await signupBtn.click();
    });

    test('should complete full registration flow: signup → verify email → login', async ({
      page
    }) => {
      // Verify email
      await page.waitForURL('/signup/check-email');
      expect(page.getByText('Please check your email for a verification link.')).toBeVisible();

      await page.goto(`${MOSAIC_BASE_URL}/auth/signup/verify/testid/easytokenpass`);
      expect(page.getByText('Verification Success')).toBeVisible();
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

    test('should complete full registration flow: signup → verify email -> failed -> resend verification code -> verify email -> success → login', async ({
      page
    }) => {
      // Verify email
      await page.waitForURL('/signup/check-email');
      expect(page.getByText('Please check your email for a verification link.')).toBeVisible();

      await page.goto(`${MOSAIC_BASE_URL}/auth/signup/verify/testid/tokenexpired`);
      await page.waitForTimeout(1500);
      expect(page.getByText('Verification Failed')).toBeVisible();
      // expect(page.getByText('Click here to resend verification code')).toBeVisible();
      // await page.getByRole('link', { name: 'here' }).click();
      await page.getByRole('button', { name: 'Resend verification code' }).click();

      // resend verification code
      // await page.waitForURL('/check-your-email');
      await page.waitForTimeout(1500);

      expect(page.getByText('Please check your email for a verification link.')).toBeVisible();
      await page.goto(`${MOSAIC_BASE_URL}/auth/signup/verify/testid/easytokenpass`);
      await page.waitForTimeout(1500);
      expect(page.getByText('Verification Success')).toBeVisible();
      expect(
        page.getByText(
          'Click here to redirect to login page or redirect automatically within 10 seconds'
        )
      ).toBeVisible();
      await page.getByRole('link', { name: 'here' }).click();
      await page.waitForURL('/login');
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

  test.describe('Password Reset', () => {
    test('should complete password reset flow: forgot password → send code to email -> confirm code -> success -> input new password → login', async ({
      page
    }) => {
      await page.goto('/login');
      await page.getByRole('link', { name: 'Forgot password?' }).click();
      await page.waitForURL('/forgot');

      let submitBtn = page.getByRole('button', { name: 'Send verification code' });
      const emailInput = page.getByLabel('Email');
      expect(submitBtn).toBeVisible();
      expect(emailInput).toBeVisible();

      const testEmail = 'test@example.com';
      await emailInput.fill(testEmail);
      await submitBtn.click();
      await page.waitForURL(`/forgot/verify?email=${testEmail}`);

      expect(page.getByRole('heading', { name: 'OTP Verification' })).toBeVisible();
      expect(page.getByText('Resend OTP in 01:00')).toBeVisible();

      let pinInputs = page.getByRole('textbox');
      expect(pinInputs.first()).toBeVisible();
      expect(pinInputs.first()).toBeEnabled();
      expect(pinInputs.nth(5)).toBeVisible();
      expect(pinInputs.nth(5)).toBeEnabled();
      expect(pinInputs.nth(6)).not.toBeVisible();

      // Input 1 by 1
      await pinInputs.first().fill('1');
      await pinInputs.nth(1).fill('2');

      pinInputs = page.getByRole('textbox');
      expect(pinInputs.first()).toBeEnabled();
      await pinInputs.nth(2).fill('3');
      await pinInputs.nth(3).fill('4');
      await pinInputs.nth(4).fill('5');
      await pinInputs.nth(5).fill('6');
      // expect(page.getByPlaceholder('123456')).toBeVisible();

      pinInputs = page.getByRole('textbox');
      expect(pinInputs.first()).toBeDisabled();
      expect(page.getByText('Wrong OTP. You have 4 more tries.')).toBeVisible();

      // simulate 'paste' event
      const firstInput = page.getByRole('textbox').first();
      expect(firstInput).toBeEnabled();
      await pasteText(firstInput, '457891');

      await page.waitForTimeout(1500);
      expect(page.getByText('Wrong OTP. You have 3 more tries.')).toBeVisible();

      pinInputs = page.getByRole('textbox');
      await pinInputs.first().fill('7');
      await pinInputs.nth(1).fill('8');
      await pasteText(pinInputs.nth(2), '9012');
      await page.waitForTimeout(1500);
      expect(page.getByRole('heading', { name: 'OTP Verification' })).not.toBeVisible(); // verification success

      expect(page.getByLabel('New password *')).toBeVisible();
      expect(page.getByLabel('Confirm password *')).toBeVisible();
      expect(page.getByRole('button', { name: 'Submit' })).toBeVisible();
      const passwordInput = page.getByLabel('New password *');
      const confirmPasswordInput = page.getByLabel('Confirm password *');
      submitBtn = page.getByRole('button', { name: 'Submit' });
      await passwordInput.fill('pass@example');
      await confirmPasswordInput.fill('pass@example');
      await submitBtn.click();

      // Password reset successfully
      await page.waitForURL('/login');
      expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
    });
  });
});
