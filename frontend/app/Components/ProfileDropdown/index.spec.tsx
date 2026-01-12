import { createRoutesStub } from 'react-router';
import { expect, describe, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProfileDropdown from '.';

const user = userEvent.setup();

const defaultProps = {
  userFirstName: 'dung',
  userLastName: 'nguyen'
};

const ProfileDropdownWithProps = () => <ProfileDropdown {...defaultProps} />;

describe('<ProfileDropdown />', () => {
  beforeEach(() => {
    const Stub = createRoutesStub([
      {
        path: '/',
        Component: ProfileDropdownWithProps
      }
    ]);
    // render the app stub at "/"
    render(<Stub initialEntries={['/']} />);
  });

  it('should render successfully and find all the elements', async () => {
    expect(screen.getByRole('button', { name: 'DN' })).toBeInTheDocument();
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('should display dropdown menu after clicking the profile image', async () => {
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'DN' }));

    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'My profile' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Sign out' })).toBeInTheDocument();
  });

  it('should close the dropdown menu after clicking outside it', async () => {
    await user.click(screen.getByRole('button', { name: 'DN' }));
    expect(screen.getByRole('link', { name: 'My profile' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Sign out' })).toBeInTheDocument();

    // simulate clicking outside
    await user.click(document.body);

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'My profile' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Sign out' })).not.toBeInTheDocument();
  });

  it('should close dropdown menu after clicking the profile image again', async () => {
    await user.click(screen.getByRole('button', { name: 'DN' }));
    expect(screen.getByRole('link', { name: 'My profile' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Sign out' })).toBeInTheDocument();

    // clicking it again
    await user.click(screen.getByRole('button', { name: 'DN' }));

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'My profile' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Sign out' })).not.toBeInTheDocument();
  });

  it('should keep dropdown menu open after clicking it', async () => {
    await user.click(screen.getByRole('button', { name: 'DN' }));
    expect(screen.getByRole('link', { name: 'My profile' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Sign out' })).toBeInTheDocument();

    // clicking the dropdown
    await user.click(screen.getByRole('menu'));
    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'My profile' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Sign out' })).toBeInTheDocument();
  });
});
