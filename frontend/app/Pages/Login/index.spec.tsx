import { createRoutesStub } from 'react-router';
import { expect, describe, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Login from './index';
import Home from '../Home';
import Signup from '../Signup';

describe('<Login />', () => {
  const user = userEvent.setup();

  it('should render successfully and find all the elements', async () => {
    const Stub = createRoutesStub([
      {
        path: '/login',
        Component: Login
      }
    ]);
    // render the app stub at "/login"
    render(<Stub initialEntries={['/login']} />);

    // find all the important elements
    expect(screen.getAllByText('Sign in')).toHaveLength(2);
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument();

    const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
    const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;

    expect(emailInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
    // expect(screen.getByRole('button', { name: 'Continue with Google' })).toBeInTheDocument();
    expect(screen.getByText('Create an account')).toBeInTheDocument();

    // check initial values
    expect(emailInput.value).toBe('');
    expect(passwordInput.value).toBe('');
  });

  it('should navigate to the signup route after clicking the link at the end of the form', async () => {
    const Stub = createRoutesStub([
      {
        path: '/login',
        Component: Login
      },
      {
        path: '/signup',
        Component: Signup
      }
    ]);
    // render the app stub at "/signup"
    render(<Stub initialEntries={['/signup']} />);

    await user.click(screen.getByText('Create an account'));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Create account' })).toBeInTheDocument();
    });
  });

  it('should focus on the first empty field to display error message if user click submit button', async () => {
    const Stub = createRoutesStub([
      {
        path: '/login',
        Component: Login
      }
    ]);
    // render the app stub at "/login"
    render(<Stub initialEntries={['/login']} />);

    const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
    await user.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(emailInput.validity.valueMissing).toBe(true);

    const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
    await user.type(emailInput, 'exampl@gmail.com');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(passwordInput.validity.valueMissing).toBe(true);
  });

  it('should render the submit button with text "Sign in..." after submitting the form', async () => {
    const ERROR_MESSAGE = 'Email or password is not correct';

    const Stub = createRoutesStub([
      {
        path: '/login',
        Component: Login,
        action: async () => {
          await new Promise((resolve) => setTimeout(resolve, 50));
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
    // render the app stub at "/login"
    render(<Stub initialEntries={['/login']} />);

    // find the elements
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');

    // simulate interactions
    await user.type(emailInput, 'dungnguyen2712002@gmail.com');
    await user.type(passwordInput, 'abcd');

    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    // immediately assert pending UI appears
    let submitBtn = screen.getByRole('button', { name: 'Sign in...' });
    expect(submitBtn).toBeInTheDocument();
    expect(submitBtn).toBeDisabled();

    // wait for action to resolve (pending ends)
    await waitFor(() => {
      expect(screen.queryByText('Sign in...')).not.toBeInTheDocument();
      submitBtn = screen.getByRole('button', { name: 'Sign in' });
      expect(submitBtn).toBeInTheDocument();
      expect(submitBtn).not.toBeDisabled();
    });
  });

  it('should render with error of invalid email after submitting with invalid email', async () => {
    const ERROR_MESSAGE = 'Please enter a valid email address';

    const Stub = createRoutesStub([
      {
        path: '/login',
        Component: Login
      }
    ]);
    // render the app stub at "/login"
    render(<Stub initialEntries={['/login']} />);

    // find the elements
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');

    // simulate interactions
    await user.type(emailInput, 'abcd');
    await user.type(passwordInput, 'abcd');

    await user.click(screen.getByRole('button', { name: 'Sign in' }));
    await waitFor(() => {
      expect(screen.getByText(ERROR_MESSAGE)).toBeInTheDocument();
    });
  });

  it('should render with error of invalid email or password after submitting with correct email and incorrect password', async () => {
    const ERROR_MESSAGE = 'Email or password is not correct';

    const Stub = createRoutesStub([
      {
        path: '/login',
        Component: Login,
        action() {
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
    // render the app stub at "/login"
    render(<Stub initialEntries={['/login']} />);

    // find the elements
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');

    // simulate interactions
    await user.type(emailInput, 'dungnguyen2712002@gmail.com');
    await user.type(passwordInput, 'abcd');

    await user.click(screen.getByRole('button', { name: 'Sign in' }));
    // await waitFor(() => {
    expect(screen.getByText(ERROR_MESSAGE)).toBeInTheDocument();
    // });
  });

  it('should navigate to the home route after logging in successfully', async () => {
    const ERROR_MESSAGE = 'Email or password is not correct';

    const Stub = createRoutesStub([
      {
        path: '/',
        Component: Home,
        loader() {
          return [
            {
              id: 1,
              name: 'Dune Guitar',
              image: '/example-guitar-dune.jpg',
              description:
                'Inspired by the desert, this guitar will transport you to a world of sand and adventure.',
              shortDescription:
                'A desert-inspired hollow body guitar with warm tones and custom desert glyph inlays.',
              price: 599
            },
            {
              id: 2,
              name: 'Motherboard Guitar',
              image: '/example-guitar-motherboard.jpg',
              description: 'This guitar is a tribute to the motherboard of a computer',
              shortDescription:
                'A tech-inspired electric guitar featuring LED lights and binary code inlays that glow under stage lights.',
              price: 649
            }
          ];
        }
      },
      {
        path: '/login',
        Component: Login,
        action() {
          return {
            success: true,
            response: {
              data: {
                user: {
                  firstName: 'dung',
                  lastName: 'nguyen',
                  username: 'dungnq',
                  email: 'dungnguyen2712002@gmail.com'
                }
              }
            }
          };
        }
      }
    ]);
    // render the app stub at "/login"
    render(<Stub initialEntries={['/login']} />);

    // find the elements
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');

    // simulate interactions
    await user.type(emailInput, 'dungnguyen2712002@gmail.com');
    await user.type(passwordInput, 'abcd');

    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => {
      expect(screen.queryByText(ERROR_MESSAGE)).not.toBeInTheDocument();
      expect(screen.getByText('Featured Guitars')).toBeInTheDocument();
    });
  });
});
