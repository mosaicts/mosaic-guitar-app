import { createRoutesStub } from 'react-router';
import { expect, describe, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NewPassword from '.';

describe('<NewPassword />', () => {
  const user = userEvent.setup();
  const fn = vi.fn();

  it('should render successfully and find all the elements', async () => {
    const Stub = createRoutesStub([
      {
        path: '/password-reset/new-password',
        Component: NewPassword
      }
    ]);
    // render the app stub at "/password-reset/new-password"
    render(<Stub initialEntries={['/password-reset/new-password']} />);

    const passwordInput = screen.getByLabelText('New password *') as HTMLInputElement;
    const confirmPasswordInput = screen.getByLabelText('Confirm password *') as HTMLInputElement;
    expect(passwordInput).toBeInTheDocument();
    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(confirmPasswordInput).toBeInTheDocument();
    expect(confirmPasswordInput).toHaveAttribute('type', 'password');

    expect(screen.queryByText('Strength: low')).not.toBeInTheDocument();
    expect(passwordInput).toHaveValue('');
    expect(confirmPasswordInput).toHaveValue('');

    expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
  });

  it('should focus on the first empty field to display error message if clicking submit button', async () => {
    const Stub = createRoutesStub([
      {
        path: '/password-reset/new-password',
        Component: NewPassword
      }
    ]);
    // render the app stub at "/password-reset/new-password"
    render(<Stub initialEntries={['/password-reset/new-password']} />);

    const passwordInput = screen.getByLabelText('New password *') as HTMLInputElement;
    const confirmPasswordInput = screen.getByLabelText('Confirm password *') as HTMLInputElement;

    await user.click(screen.getByRole('button', { name: 'Submit' }));
    expect(passwordInput.validity.valueMissing).toBe(true);
    // expect(firstnameInput).toBe(document.activeElement);

    await user.type(passwordInput, 'abcdefgh');
    await user.click(screen.getByRole('button', { name: 'Submit' }));
    // expect(lastNameInput).toBe(document.activeElement);
    expect(confirmPasswordInput.validity.valueMissing).toBe(true);
  });

  it.skip('should keep displaying error of short password and focusing the field if clicking outside it', async () => {
    const ERROR_MESSAGE = 'Password must be at least 8 characters';

    const Stub = createRoutesStub([
      {
        path: '/password-reset/new-password',
        Component: NewPassword
      }
    ]);
    // render the app stub at "/password-reset/new-password"
    render(<Stub initialEntries={['/password-reset/new-password']} />);

    const passwordInput = screen.getByLabelText('New password *') as HTMLInputElement;
    const confirmPasswordInput = screen.getByLabelText('Confirm password *') as HTMLInputElement;

    await user.type(passwordInput, 'short');
    expect(passwordInput.value).toBe('short');
    expect(passwordInput.validationMessage).toBe(ERROR_MESSAGE);

    await user.type(confirmPasswordInput, 'abcd');
    expect(confirmPasswordInput.value).toBe('');

    expect(passwordInput).toBe(document.activeElement);
    expect(passwordInput.validationMessage).toBe(ERROR_MESSAGE);
  });

  it("should display password's strength: low", async () => {
    const Stub = createRoutesStub([
      {
        path: '/password-reset/new-password',
        Component: NewPassword
      }
    ]);
    // render the app stub at "/password-reset/new-password"
    render(<Stub initialEntries={['/password-reset/new-password']} />);

    const passwordInput = screen.getByLabelText('New password *') as HTMLInputElement;

    await user.type(passwordInput, 'abcdefgh');

    expect(screen.getByText('Strength: low')).toBeInTheDocument();
  });

  it("should display password's strength: medium", async () => {
    const Stub = createRoutesStub([
      {
        path: '/password-reset/new-password',
        Component: NewPassword
      }
    ]);
    // render the app stub at "/password-reset/new-password"
    render(<Stub initialEntries={['/password-reset/new-password']} />);

    const passwordInput = screen.getByLabelText('New password *') as HTMLInputElement;

    await user.type(passwordInput, 'abcdef134');

    expect(screen.getByText('Strength: medium')).toBeInTheDocument();
  });

  it("should display password's strength: strong", async () => {
    const Stub = createRoutesStub([
      {
        path: '/password-reset/new-password',
        Component: NewPassword
      }
    ]);
    // render the app stub at "/password-reset/new-password"
    render(<Stub initialEntries={['/password-reset/new-password']} />);

    const passwordInput = screen.getByLabelText('New password *') as HTMLInputElement;

    await user.type(passwordInput, 'Abcdef134');

    expect(screen.getByText('Strength: strong')).toBeInTheDocument();
  });

  it('should display no error if user copy the text from password input to the confirm password input and the password input text is valid (>=8 characters)', async () => {
    const Stub = createRoutesStub([
      {
        path: '/password-reset/new-password',
        Component: NewPassword
      }
    ]);
    // render the app stub at "/password-reset/new-password"
    render(<Stub initialEntries={['/password-reset/new-password']} />);

    let passwordInput = screen.getByLabelText('New password *') as HTMLInputElement;
    const confirmPasswordInput = screen.getByLabelText('Confirm password *') as HTMLInputElement;

    // simulate interactions
    await user.type(passwordInput, 'abcdefgh');
    await user.keyboard('{Control>}A{/Control}'); // select all
    await user.copy();
    await user.click(confirmPasswordInput);
    await user.paste();

    expect(confirmPasswordInput).toHaveValue('abcdefgh');
    expect(confirmPasswordInput.validationMessage).toBe('');
  });

  it.skip('should keep displaying error of mismatched confirm password and focusing the field if clicking outside it', async () => {
    const ERROR_MESSAGE = 'Password does not match';

    const Stub = createRoutesStub([
      {
        path: '/password-reset/new-password',
        Component: NewPassword
      }
    ]);
    // render the app stub at "/password-reset/new-password"
    render(<Stub initialEntries={['/password-reset/new-password']} />);

    let passwordInput = screen.getByLabelText('New password *') as HTMLInputElement;
    const confirmPasswordInput = screen.getByLabelText('Confirm password *') as HTMLInputElement;

    // simulate interactions
    await user.type(passwordInput, 'abcdefgh');
    await user.type(confirmPasswordInput, 'abcd');

    expect(confirmPasswordInput.validationMessage).toBe(ERROR_MESSAGE);
    expect(confirmPasswordInput).toBe(document.activeElement);

    await user.type(passwordInput, 'abcd');
    expect(passwordInput.value).toBe('abcdefgh'); // expect password input to not change
    expect(confirmPasswordInput).toBe(document.activeElement);
    expect(confirmPasswordInput.validationMessage).toBe(ERROR_MESSAGE);
  });

  it('should render the submit button with text "Submitting..." after submitting the form', async () => {
    const ERROR_MESSAGE = "Password don't match";

    const Stub = createRoutesStub([
      {
        path: '/password-reset/new-password',
        Component: NewPassword,
        action: async () => {
          await new Promise((resolve) => setTimeout(resolve, 50));
          return {
            success: false,
            response: {
              errors: {
                confirmPassword: ERROR_MESSAGE
              }
            }
          };
        }
      }
    ]);
    // render the app stub at "/password-reset/new-password"
    render(<Stub initialEntries={['/password-reset/new-password']} />);

    // find the elements
    let passwordInput = screen.getByLabelText('New password *') as HTMLInputElement;
    const confirmPasswordInput = screen.getByLabelText('Confirm password *') as HTMLInputElement;

    // simulate interactions
    await user.type(passwordInput, 'abcdefgh');
    await user.type(confirmPasswordInput, 'abcdefgh');

    await user.click(screen.getByRole('button', { name: 'Submit' }));

    // immediately assert pending UI appears
    let submitBtn = screen.getByRole('button', { name: 'Submitting...' });
    expect(submitBtn).toBeInTheDocument();
    expect(submitBtn).toBeDisabled();

    // wait for action to resolve (pending ends)
    await waitFor(() => {
      expect(screen.queryByText('Submitting...')).not.toBeInTheDocument();
      submitBtn = screen.getByRole('button', { name: 'Submit' });
      expect(submitBtn).toBeInTheDocument();
      expect(submitBtn).not.toBeDisabled();
    });
  });

  it('should not be able to submit if password or confirm password is invalid', async () => {
    const ERROR_MESSAGE = 'Password does not match';

    const Stub = createRoutesStub([
      {
        path: '/password-reset/new-password',
        Component: NewPassword,
        action() {
          fn();
        }
      }
    ]);
    // render the app stub at "/login"
    render(<Stub initialEntries={['/password-reset/new-password']} />);

    // find the elements
    const passwordInput = screen.getByLabelText('New password *') as HTMLInputElement;
    const confirmPasswordInput = screen.getByLabelText('Confirm password *') as HTMLInputElement;

    // simulate interactions
    await user.type(passwordInput, 'abcdefgh');
    await user.type(confirmPasswordInput, 'abcdefghi');
    await user.click(screen.getByRole('button', { name: 'Submit' }));
    expect(confirmPasswordInput.validationMessage).toBe(ERROR_MESSAGE);
    expect(fn).not.toHaveBeenCalled();
  });
});
