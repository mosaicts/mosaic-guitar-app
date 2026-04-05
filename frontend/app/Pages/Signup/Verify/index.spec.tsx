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

  it('should display unexpected errors if something goes wrong in the backend after clicking the button successfully for failed verification', async () => {
    const ERROR_MESSAGE = 'Error resending verification code';

    const Stub = createRoutesStub([
      {
        path: '/signup/verify',
        Component: SignupVerify,
        action: () => {
          fn();
          return {
            success: false,
            response: {
              data: {
                message: ERROR_MESSAGE
              }
            }
          };
        }
      }
    ]);
    render(<Stub initialEntries={['/signup/verify?status=failed']} />);
    const submitBtn = screen.getByRole('button', { name: 'Resend verification code' });
    await user.click(submitBtn);
    await waitFor(() => {
      expect(fn).toHaveBeenCalled();
      expect(screen.getByText(ERROR_MESSAGE)).toBeVisible();
    });
  });

  it('should navigate to /check-email page after clicking the button successfully for failed verification', async () => {
    const Stub = createRoutesStub([
      {
        path: '/signup/check-email',
        Component: CheckEmail
      },
      {
        path: '/signup/verify',
        Component: SignupVerify,
        action: () => {
          fn();
          return redirect('/signup/check-email');
        }
      }
    ]);
    render(<Stub initialEntries={['/signup/verify?status=failed']} />);
    const submitBtn = screen.getByRole('button', { name: 'Resend verification code' });
    expect(submitBtn).toBeVisible();
    expect(submitBtn).toBeEnabled();

    await user.click(submitBtn);
    expect(fn).toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Resend verification code...' })).toBeVisible();
    await waitFor(() => {
      expect(
        screen.getByText('Please check your email for a verification link.')
      ).toBeInTheDocument();
    });
  });
});
