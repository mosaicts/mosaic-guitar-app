// https://github.com/testing-library/user-event/issues/1115
import { createRoutesStub } from 'react-router';
import { expect, describe, it } from 'vitest';
import { render, screen, waitFor, act, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { redirect } from 'react-router';
import ResetVerify from './index';
import Login from '@/Pages/Login';
import Reset from '../Reset';

describe('<ResetVerify />', () => {
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

  it('should render successfully and find all the elements', async () => {
    const Stub = createRoutesStub([
      {
        path: '/forgot/verify',
        Component: ResetVerify
      }
    ]);
    render(<Stub initialEntries={['/forgot/verify']} />);

    expect(screen.getByText('OTP Verification')).toBeVisible();
    expect(screen.getAllByRole('textbox')).toHaveLength(6);
    expect(screen.getByRole('button', { name: 'Resend OTP in 00:30' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeVisible();
  });

  it('should update remaining times to resend after some time passes accordingly', async () => {
    const Stub = createRoutesStub([
      {
        path: '/forgot/verify',
        Component: ResetVerify
      }
    ]);
    render(<Stub initialEntries={['/forgot/verify']} />);

    expect(screen.getByRole('button', { name: 'Resend OTP in 00:30' })).toBeVisible();
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(screen.getByRole('button', { name: 'Resend OTP in 00:28' })).toBeVisible();
    act(() => {
      vi.advanceTimersByTime(10_000);
    });
    expect(screen.getByRole('button', { name: 'Resend OTP in 00:18' })).toBeVisible();
    act(() => {
      vi.advanceTimersByTime(19_000);
    });
    expect(screen.getByRole('button', { name: 'Resend OTP' })).toBeVisible();
  });

  it('should be able to resend code after timer expires then reset the timer', async () => {
    const Stub = createRoutesStub([
      {
        path: '/forgot/verify',
        Component: ResetVerify,
        action() {
          fn();
        }
      }
    ]);
    render(<Stub initialEntries={['/forgot/verify']} />);
    expect(screen.getByRole('button', { name: 'Resend OTP in 00:30' })).toBeVisible();

    act(() => {
      vi.advanceTimersByTime(61_000);
    });

    expect(screen.getByRole('button', { name: 'Resend OTP' })).toBeVisible();
    const resendBtn = screen.getByRole('button', { name: 'Resend OTP' });

    await act(async () => {
      await user.click(resendBtn);
    });
    expect(fn).toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Resend OTP in 00:30' })).toBeVisible();
  });

  it('should call route action when all pin inputs are filled', async () => {
    const Stub = createRoutesStub([
      {
        path: '/forgot/verify',
        Component: ResetVerify,
        action() {
          fn();
        }
      }
    ]);
    render(<Stub initialEntries={['/forgot/verify']} />);

    let pinInputs = screen.getAllByRole('textbox');
    for (let i = 0; i < pinInputs.length; ++i) {
      await act(async () => {
        await user.type(pinInputs[i], i + 1 + '');
      });
    }
    expect(fn).toHaveBeenCalled();
  });

  it('should redirect to login route when user cancel', async () => {
    const Stub = createRoutesStub([
      {
        path: '/',
        Component: Login
      },
      {
        path: '/forgot/verify',
        Component: ResetVerify,
        action() {
          return redirect('/login');
        }
      }
    ]);
    render(<Stub initialEntries={['/forgot/verify']} />);

    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument();
  });

  it('should display errors when user inputs wrong OTP', async () => {
    const ERROR_MESSAGE = 'Wrong OTP. You have 4 more tries';

    const Stub = createRoutesStub([
      {
        path: '/forgot/verify',
        Component: ResetVerify,
        action() {
          fn();
          return {
            success: false,
            response: {
              message: ERROR_MESSAGE
            }
          };
        }
      }
    ]);
    render(<Stub initialEntries={['/forgot/verify']} />);

    let pinInputs = screen.getAllByRole('textbox');
    for (let i = 0; i < pinInputs.length; ++i) {
      await act(async () => {
        await user.type(pinInputs[i], i + 1 + '');
      });
    }
    expect(fn).toHaveBeenCalled();
    expect(screen.getByText(ERROR_MESSAGE)).toBeVisible();
  });

  it('should redirect to the new page to set new password for successful verification', async () => {
    const ERROR_MESSAGE = 'Wrong OTP. You have 4 more tries';

    const Stub = createRoutesStub([
      {
        path: '/reset',
        Component: Reset
      },
      {
        path: '/forgot/verify',
        Component: ResetVerify,
        action() {
          fn();
          return redirect(`/reset`);
        }
      }
    ]);
    render(<Stub initialEntries={['/forgot/verify']} />);

    let pinInputs = screen.getAllByRole('textbox');
    for (let i = 0; i < pinInputs.length; ++i) {
      await act(async () => {
        await user.type(pinInputs[i], i + 1 + '');
      });
    }
    expect(fn).toHaveBeenCalled();
    expect(screen.queryByText(ERROR_MESSAGE)).not.toBeInTheDocument();
    expect(screen.getByLabelText('New password *')).toBeVisible();
  });
});
