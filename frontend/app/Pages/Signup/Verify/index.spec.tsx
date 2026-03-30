import { createRoutesStub } from 'react-router';
import { expect, describe, it } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import { redirect } from 'react-router';
import userEvent from '@testing-library/user-event';
import Login from '@/Pages/Login';
import SignupVerify from '.';
import CheckEmail from '@/Pages/Signup/CheckEmail';

describe('<SignupVerify />', () => {
  const fn = vi.fn();
  const user = userEvent.setup({
    advanceTimers: vi.advanceTimersByTime
  });

  beforeAll(() => {
    // https://vitest.dev/api/vi.html#vi-stubglobal
    vi.stubGlobal('jest', {
      advanceTimersByTime: vi.advanceTimersByTime
    });
  });

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    act(() => {
      vi.runOnlyPendingTimers();
    });
    vi.useRealTimers();
    vi.resetAllMocks();
  });

  afterAll(() => {
    vi.unstubAllGlobals();
  });

  it('should render successfully and find all the elements after successful verification', async () => {
    const Stub = createRoutesStub([
      {
        path: '/login',
        Component: Login
      },
      {
        path: '/signup/verify',
        Component: SignupVerify
      }
    ]);
    render(<Stub initialEntries={['/signup/verify?status=success']} />);

    expect(screen.getByRole('link', { name: 'here' })).toBeVisible();
  });

  it('should navigate to /login automatically after timeout for successful verification', async () => {
    const Stub = createRoutesStub([
      {
        path: '/login',
        Component: Login
      },
      {
        path: '/signup/verify',
        Component: SignupVerify
      }
    ]);
    render(<Stub initialEntries={['/signup/verify?status=success']} />);

    act(() => {
      vi.advanceTimersByTime(10000);
    });
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument();
    });
  });

  it('should render successfully for failed verification', async () => {
    const Stub = createRoutesStub([
      {
        path: '/signup/verify',
        Component: SignupVerify
      }
    ]);
    render(<Stub initialEntries={['/signup/verify?status=failed']} />);
    expect(screen.getByRole('button', { name: 'Resend verification code' })).toBeVisible();
  });

  it('should navigate to /check-email page after clicking the button for failed verification', async () => {
    const Stub = createRoutesStub([
      {
        path: '/signup/check-email',
        Component: CheckEmail
      },
      {
        path: '/signup/verify',
        Component: SignupVerify,
        action: () => {
          return redirect('/signup/check-email');
        }
      }
    ]);
    render(<Stub initialEntries={['/signup/verify?status=failed']} />);
    expect(screen.getByRole('button', { name: 'Resend verification code' })).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Resend verification code' }));
    expect(screen.getByRole('button', { name: 'Resend verification code...' })).toBeVisible();
    await waitFor(() => {
      expect(
        screen.getByText('Please check your email for a verification link.')
      ).toBeInTheDocument();
    });
  });
});
