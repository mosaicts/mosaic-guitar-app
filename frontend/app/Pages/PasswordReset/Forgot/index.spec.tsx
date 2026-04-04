import { createRoutesStub } from 'react-router';
import { expect, describe, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { redirect } from 'react-router';
import userEvent from '@testing-library/user-event';
import Forgot from '.';
import ForgotVerify from '../Verify';

describe('<Forgot />', () => {
  const user = userEvent.setup();
  const fn = vi.fn();

  it('should render successfully and find all the elements', async () => {
    const Stub = createRoutesStub([
      {
        path: '/forgot',
        Component: Forgot
      }
    ]);
    // render the app stub at "forgot"
    render(<Stub initialEntries={['/forgot']} />);

    expect(
      screen.getByText(
        "Enter your user account's verified email address and we will send you a verification code"
      )
    ).toBeInTheDocument();
    const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
    expect(emailInput).toBeInTheDocument();
    expect(emailInput).toBeEnabled();
    expect(emailInput).toBeRequired();
    const submitBtn = screen.getByRole('button', { name: 'Send Verification Code' });
    expect(submitBtn).toBeInTheDocument();
    expect(submitBtn).toBeEnabled();
  });

  it('should not be able to submit and display validation error if email is invalid', async () => {
    const ERROR_MESSAGE = 'Constraints not satisfied';

    const Stub = createRoutesStub([
      {
        path: '/forgot',
        Component: Forgot,
        action() {
          fn();
        }
      }
    ]);
    // render the app stub at "forgot"
    render(<Stub initialEntries={['/forgot']} />);
    const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
    await user.type(emailInput, 'abcdef');
    await user.click(screen.getByRole('button', { name: 'Send Verification Code' }));

    expect(emailInput.validationMessage).toBe(ERROR_MESSAGE);
    expect(fn).not.toHaveBeenCalled();
  });

  it('should display unexpected error if something goes wrong in the backend after submitting valid email', async () => {
    const ERROR_MESSAGE = 'Error sending verification code';

    const Stub = createRoutesStub([
      {
        path: '/forgot',
        Component: Forgot,
        action() {
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
    // render the app stub at "forgot"
    render(<Stub initialEntries={['/forgot']} />);
    const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
    await user.type(emailInput, 'text@example.com');
    await user.click(screen.getByRole('button', { name: 'Send Verification Code' }));

    expect(fn).toHaveBeenCalled();
    expect(screen.getByText(ERROR_MESSAGE)).toBeInTheDocument();
  });

  it('should navigate to /forgot/verify after submitting successfully', async () => {
    const Stub = createRoutesStub([
      {
        path: '/forgot',
        Component: Forgot,
        action() {
          return redirect('/forgot/verify');
        }
      },
      {
        path: '/forgot/verify',
        Component: ForgotVerify
      }
    ]);

    // render the app stub at "forgot"
    render(<Stub initialEntries={['/forgot']} />);

    const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
    await user.type(emailInput, 'text@example.com');
    await user.click(screen.getByRole('button', { name: 'Send Verification Code' }));
    await waitFor(() => {
      expect(screen.getByText('OTP Verification')).toBeInTheDocument();
    });
  });
});
