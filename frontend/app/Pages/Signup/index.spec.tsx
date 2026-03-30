import { createRoutesStub } from 'react-router';
import { expect, describe, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { redirect } from 'react-router';
import Signup from './index';
import Login from '../Login';
import CheckEmail from './CheckEmail';

describe('<Signup />', () => {
  const user = userEvent.setup();

  it('should render successfully and find all the elements', async () => {
    const Stub = createRoutesStub([
      {
        path: '/signup',
        Component: Signup
      }
    ]);
    // render the app stub at "/signup"
    render(<Stub initialEntries={['/signup']} />);

    // find all the important elements
    expect(screen.getByText('Create an account')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create account' })).toBeInTheDocument();

    // find the elements
    const firstNameInput = screen.getByLabelText('First name *') as HTMLInputElement;
    const lastNameInput = screen.getByLabelText('Last name *') as HTMLInputElement;
    const usernameInput = screen.getByLabelText('Username *') as HTMLInputElement;
    const emailInput = screen.getByLabelText('Email *') as HTMLInputElement;
    const passwordInput = screen.getByLabelText('Password *') as HTMLInputElement;
    const confirmPasswordInput = screen.getByLabelText('Confirm password *') as HTMLInputElement;

    expect(firstNameInput).toBeInTheDocument();
    expect(lastNameInput).toBeInTheDocument();
    expect(usernameInput).toBeInTheDocument();
    expect(emailInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(confirmPasswordInput).toBeInTheDocument();
    expect(confirmPasswordInput).toHaveAttribute('type', 'password');
    expect(screen.getByText('→ Login')).toBeInTheDocument();

    expect(screen.queryByText('Strength: low')).not.toBeInTheDocument();

    // check initial values
    expect(firstNameInput).toHaveValue('');
    expect(lastNameInput).toHaveValue('');
    expect(usernameInput).toHaveValue('');
    expect(emailInput).toHaveValue('');
    expect(passwordInput).toHaveValue('');
    expect(confirmPasswordInput).toHaveValue('');
  });

  it('should navigate to the login route after clicking the Login link at the end of the form', async () => {
    const Stub = createRoutesStub([
      {
        path: '/login',
        Component: Login
      },
      {
        path: '/signup',
        Component: Signup,
        action() {
          return redirect('/login');
        }
      }
    ]);
    // render the app stub at "/signup"
    render(<Stub initialEntries={['/signup']} />);

    await user.click(screen.getByText('→ Login'));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument();
    });
  });

  it('should focus on the first empty field to display error message if clicking submit button', async () => {
    const Stub = createRoutesStub([
      {
        path: '/signup',
        Component: Signup
      }
    ]);
    // render the app stub at "/signup"
    render(<Stub initialEntries={['/signup']} />);

    const firstnameInput = screen.getByLabelText('First name *') as HTMLInputElement;
    await user.click(screen.getByRole('button', { name: 'Create account' }));
    expect(firstnameInput.validity.valueMissing).toBe(true);
    // expect(firstnameInput).toBe(document.activeElement);

    const lastNameInput = screen.getByLabelText('Last name *') as HTMLInputElement;
    await user.type(firstnameInput, 'abcd');
    await user.click(screen.getByRole('button', { name: 'Create account' }));
    // expect(lastNameInput).toBe(document.activeElement);
    expect(lastNameInput.validity.valueMissing).toBe(true);
  });

  it.skip('should keep displaying error of short password and focusing the field if clicking outside it', async () => {
    const ERROR_MESSAGE = 'Password must be at least 8 characters';

    const Stub = createRoutesStub([
      {
        path: '/signup',
        Component: Signup
      }
    ]);
    // render the app stub at "/signup"
    render(<Stub initialEntries={['/signup']} />);

    const passwordInput = screen.getByLabelText('Password *') as HTMLInputElement;
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
        path: '/signup',
        Component: Signup
      }
    ]);
    // render the app stub at "/signup"
    render(<Stub initialEntries={['/signup']} />);

    const passwordInput = screen.getByLabelText('Password *') as HTMLInputElement;

    await user.type(passwordInput, 'abcdefgh');

    expect(screen.getByText('Strength: low')).toBeInTheDocument();
  });

  it("should display password's strength: medium", async () => {
    const Stub = createRoutesStub([
      {
        path: '/signup',
        Component: Signup
      }
    ]);
    // render the app stub at "/signup"
    render(<Stub initialEntries={['/signup']} />);

    const passwordInput = screen.getByLabelText('Password *') as HTMLInputElement;

    await user.type(passwordInput, 'abcdef134');

    expect(screen.getByText('Strength: medium')).toBeInTheDocument();
  });

  it("should display password's strength: strong", async () => {
    const Stub = createRoutesStub([
      {
        path: '/signup',
        Component: Signup
      }
    ]);
    // render the app stub at "/signup"
    render(<Stub initialEntries={['/signup']} />);

    const passwordInput = screen.getByLabelText('Password *') as HTMLInputElement;

    await user.type(passwordInput, 'Abcdef134');

    expect(screen.getByText('Strength: strong')).toBeInTheDocument();
  });

  it('should display no error if user copy the text from password input to the confirm password input and the password input text is valid (>=8 characters)', async () => {
    const Stub = createRoutesStub([
      {
        path: '/signup',
        Component: Signup
      }
    ]);
    // render the app stub at "/signup"
    render(<Stub initialEntries={['/signup']} />);

    let passwordInput = screen.getByLabelText('Password *') as HTMLInputElement;
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
        path: '/signup',
        Component: Signup
      }
    ]);
    // render the app stub at "/signup"
    render(<Stub initialEntries={['/signup']} />);

    let passwordInput = screen.getByLabelText('Password *') as HTMLInputElement;
    const confirmPasswordInput = screen.getByLabelText('Confirm password *') as HTMLInputElement;

    // simulate interactions
    await user.type(passwordInput, 'abcdefgh');
    await user.type(confirmPasswordInput, 'abcd');

    expect(confirmPasswordInput.validationMessage).toBe(ERROR_MESSAGE);
    expect(confirmPasswordInput).toBe(document.activeElement);

    await user.type(passwordInput, 'abcd');
    expect(passwordInput.value).toBe('abcdefgh');
    expect(confirmPasswordInput).toBe(document.activeElement);
    expect(confirmPasswordInput.validationMessage).toBe(ERROR_MESSAGE);
  });

  it('should display error of invalid email after submitting', async () => {
    const ERROR_MESSAGE = 'Please enter a valid email address';

    const Stub = createRoutesStub([
      {
        path: '/signup',
        Component: Signup
      }
    ]);
    // render the app stub at "/signup"
    render(<Stub initialEntries={['/signup']} />);

    // find the elements
    const firstNameInput = screen.getByLabelText('First name *');
    const lastNameInput = screen.getByLabelText('Last name *');
    const usernameInput = screen.getByLabelText('Username *');
    const emailInput = screen.getByLabelText('Email *');
    const passwordInput = screen.getByLabelText('Password *');
    const confirmPasswordInput = screen.getByLabelText('Confirm password *');

    // simulate interactions
    await user.type(firstNameInput, 'test');
    await user.type(lastNameInput, 'example');
    await user.type(usernameInput, 'testusr');
    await user.type(emailInput, 'test2712002');
    await user.type(passwordInput, 'abcdefgh');
    await user.type(confirmPasswordInput, 'abcdefgh');

    await user.click(screen.getByRole('button', { name: 'Create account' }));

    await waitFor(() => {
      expect(screen.getByText(ERROR_MESSAGE)).toBeInTheDocument();
    });
  });

  it('should render the submit button with text "Create account..." after submitting the form', async () => {
    const EMAIL_ERROR_MESSAGE = 'Email already in use';
    const USERNAME_ERROR_MESSAGE = 'Username already in use';

    const Stub = createRoutesStub([
      {
        path: '/signup',
        Component: Signup,
        action: async () => {
          await new Promise((resolve) => setTimeout(resolve, 500));
          return {
            success: false,
            response: {
              errors: {
                email: [EMAIL_ERROR_MESSAGE],
                username: [USERNAME_ERROR_MESSAGE]
              }
            }
          };
        }
      }
    ]);
    // render the app stub at "/signup"
    render(<Stub initialEntries={['/signup']} />);

    // find the elements
    const firstNameInput = screen.getByLabelText('First name *');
    const lastNameInput = screen.getByLabelText('Last name *');
    const usernameInput = screen.getByLabelText('Username *');
    const emailInput = screen.getByLabelText('Email *');
    const passwordInput = screen.getByLabelText('Password *');
    const confirmPasswordInput = screen.getByLabelText('Confirm password *');

    // simulate interactions
    await user.type(firstNameInput, 'test');
    await user.type(lastNameInput, 'example');
    await user.type(usernameInput, 'testusr');
    await user.type(emailInput, 'example@gmail.com');
    await user.type(passwordInput, 'abcdefgh');
    await user.type(confirmPasswordInput, 'abcdefgh');

    await user.click(screen.getByRole('button', { name: 'Create account' }));

    // immediately assert pending UI appears
    let submitBtn = screen.getByRole('button', { name: 'Create account...' });
    expect(submitBtn).toBeInTheDocument();
    expect(submitBtn).toBeDisabled();

    // wait for action to resolve (pending ends)
    await waitFor(() => {
      expect(screen.queryByText('Create account...')).not.toBeInTheDocument();
      submitBtn = screen.getByRole('button', { name: 'Create account' });
      expect(submitBtn).toBeInTheDocument();
      expect(submitBtn).not.toBeDisabled();
    });
  });

  it('should display error for corresponding fields after submitting with all non-empty inputs', async () => {
    const EMAIL_ERROR_MESSAGE = 'Email already in use';
    const USERNAME_ERROR_MESSAGE = 'Username already in use';

    const Stub = createRoutesStub([
      {
        path: '/signup',
        Component: Signup,
        action() {
          return {
            success: false,
            response: {
              errors: {
                email: [EMAIL_ERROR_MESSAGE],
                username: [USERNAME_ERROR_MESSAGE]
              }
            }
          };
        }
      }
    ]);
    // render the app stub at "/login"
    render(<Stub initialEntries={['/signup']} />);

    // find the elements
    const firstNameInput = screen.getByLabelText('First name *');
    const lastNameInput = screen.getByLabelText('Last name *');
    const usernameInput = screen.getByLabelText('Username *');
    const emailInput = screen.getByLabelText('Email *');
    const passwordInput = screen.getByLabelText('Password *');
    const confirmPasswordInput = screen.getByLabelText('Confirm password *');

    // simulate interactions
    await user.type(firstNameInput, 'test');
    await user.type(lastNameInput, 'example');
    await user.type(usernameInput, 'testusr');
    await user.type(emailInput, 'example@gmail.com');
    await user.type(passwordInput, 'abcdefgh');
    await user.type(confirmPasswordInput, 'abcdefgh');

    await user.click(screen.getByRole('button', { name: 'Create account' }));

    await waitFor(() => {
      expect(screen.getByText(EMAIL_ERROR_MESSAGE)).toBeInTheDocument();
      expect(screen.getByText(USERNAME_ERROR_MESSAGE)).toBeInTheDocument();
    });
  });

  it('should navigate to the /check-email route after signing up successfully', async () => {
    const Stub = createRoutesStub([
      {
        path: '/check-email',
        Component: CheckEmail
      },
      {
        path: '/signup',
        Component: Signup,
        action() {
          return redirect('/check-email');
        }
      }
    ]);
    // render the app stub at "/signup"
    render(<Stub initialEntries={['/signup']} />);

    // find the elements
    const firstNameInput = screen.getByLabelText('First name *');
    const lastNameInput = screen.getByLabelText('Last name *');
    const usernameInput = screen.getByLabelText('Username *');
    const emailInput = screen.getByLabelText('Email *');
    const passwordInput = screen.getByLabelText('Password *');
    const confirmPasswordInput = screen.getByLabelText('Confirm password *');

    // simulate interactions
    await user.type(firstNameInput, 'test');
    await user.type(lastNameInput, 'example');
    await user.type(usernameInput, 'testusr');
    await user.type(emailInput, 'example@gmail.com');
    await user.type(passwordInput, 'abcdefgh');
    await user.type(confirmPasswordInput, 'abcdefgh');

    await user.click(screen.getByRole('button', { name: 'Create account' }));

    await waitFor(() => {
      expect(
        screen.getByText('Please check your email for a verification link.')
      ).toBeInTheDocument();
    });
  });
});
