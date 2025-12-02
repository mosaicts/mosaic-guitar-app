import { createRoutesStub } from 'react-router';
import { useState, useRef } from 'react';
import { expect, describe, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Navbar from '.';

const user = userEvent.setup();

const onClickOutside = vi.fn();

const defaultProps = {
  navState: '',
  onClickOutside
};

const NavbarWithProps = () => <Navbar {...defaultProps} />;

const NavbarWrapperWithState = () => {
  const ref = useRef<HTMLButtonElement | null>(null);
  const [isNavOpen, setNavOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => {
          setNavOpen(!isNavOpen);
        }}
        ref={ref}
      >
        Nav
      </button>
      {isNavOpen && (
        <Navbar
          navState=""
          onClickOutside={() => {
            setNavOpen(false);
          }}
        />
      )}
    </>
  );
};

describe('<Navbar />', () => {
  it('should render successfully and find all the elements', async () => {
    const Stub = createRoutesStub([
      {
        path: '/',
        Component: NavbarWithProps
      }
    ]);
    // render the app stub at "/"
    render(<Stub initialEntries={['/']} />);

    expect(screen.queryByRole('menu')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'home Home' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'orders Orders' })).toBeInTheDocument();
  });

  it('should display navbar after clicking the nav button', async () => {
    const Stub = createRoutesStub([
      {
        path: '/',
        Component: NavbarWrapperWithState
      }
    ]);
    // render the app stub at "/"
    render(<Stub initialEntries={['/']} />);

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Nav' }));

    expect(screen.queryByRole('menu')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'home Home' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'orders Orders' })).toBeInTheDocument();
  });

  it('should close the navbar after clicking outside it', async () => {
    const Stub = createRoutesStub([
      {
        path: '/',
        Component: NavbarWrapperWithState
      }
    ]);
    // render the app stub at "/"
    render(<Stub initialEntries={['/']} />);

    await user.click(screen.getByRole('button', { name: 'Nav' }));

    // simulate clicking outside
    await user.click(document.body);

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'home Home' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'orders Orders' })).not.toBeInTheDocument();
  });

  it('should close navbar menu after clicking the button again', async () => {
    const Stub = createRoutesStub([
      {
        path: '/',
        Component: NavbarWrapperWithState
      }
    ]);
    // render the app stub at "/"
    render(<Stub initialEntries={['/']} />);

    await user.click(screen.getByRole('button', { name: 'Nav' }));

    // simulate clicking the button
    await user.click(screen.getByRole('button', { name: 'Nav' }));

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'home Home' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'orders Orders' })).not.toBeInTheDocument();
  });

  it('should keep dropdown menu open after clicking it', async () => {
    const Stub = createRoutesStub([
      {
        path: '/',
        Component: NavbarWrapperWithState
      }
    ]);
    // render the app stub at "/"
    render(<Stub initialEntries={['/']} />);

    await user.click(screen.getByRole('button', { name: 'Nav' }));

    // simulate clicking the nav
    await user.click(screen.getByRole('menu'));

    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'home Home' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'orders Orders' })).toBeInTheDocument();
  });
});
