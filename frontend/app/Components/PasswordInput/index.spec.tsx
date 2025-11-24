import { createRoutesStub, Form } from 'react-router';
import { expect, describe, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PasswordInput from './';

const fn = vi.fn();
const PasswordForm = () => (
  <>
    <Form method="post" onSubmit={fn}>
      <label htmlFor="password-input">Password</label>
      <PasswordInput
        onBlur={(e: React.ChangeEvent<HTMLInputElement>) => {
          e.target.reportValidity();
        }}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          // if password length < 8 set and error
          const value = e.target.value;
          if (value.length < 8) {
            e.target.setCustomValidity('Password must be at least 8 characters');
          } else {
            e.target.setCustomValidity('');
          }
        }}
      />
      <button type="submit">Submit</button>
    </Form>
  </>
);

describe('<PasswordInput />', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    const Stub = createRoutesStub([
      {
        path: '/password',
        Component: PasswordForm
      }
    ]);
    // render the app stub at "/register"
    render(<Stub initialEntries={['/password']} />);
  });

  it('should render password invisibile and visibile when user clicks the toggling eye and invisible again when user clicks again', async () => {
    // find the elements
    const passwordInput = screen.getByLabelText('Password');

    // simulate interactions
    await user.type(passwordInput, 'abcd');

    // expect password to be hidden by default
    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password');
    // password has visibitlity button displaying on by default
    expect(screen.getByRole('button', { name: 'visibility' })).toBeInTheDocument();

    // user click the first time
    await user.click(screen.getByRole('button', { name: 'visibility' }));
    // expect password to be shown
    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'text');
    // expect password to hav visibility button displaying off
    expect(screen.getByRole('button', { name: 'visibility_off' })).toBeInTheDocument();

    // user click again
    await user.click(screen.getByRole('button', { name: 'visibility_off' }));
    // expect password to be hidden
    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password');
    // expect password to hav visibility button displaying on again
    expect(screen.getByRole('button', { name: 'visibility' })).toBeInTheDocument();
  });

  it('should not be able to submit form if password is not long enough', async () => {
    // find the elements
    const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;

    // simulate interactions
    await user.type(passwordInput, 'abcd');
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    expect(fn).not.toHaveBeenCalled();
    expect(passwordInput.validationMessage).toBe('Password must be at least 8 characters');
  });
});
