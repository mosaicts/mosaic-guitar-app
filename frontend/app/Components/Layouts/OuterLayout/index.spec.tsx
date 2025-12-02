import { createRoutesStub } from 'react-router';
import { expect, describe, it } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Layout from '.';

const user = userEvent.setup();

describe('<Layout />', () => {
  it('should render successfully, find all the elements, and close the nav by default - mobile view', async () => {
    global.innerWidth = 512;

    const Stub = createRoutesStub([
      {
        path: '/',
        Component: Layout
      }
    ]);
    // render the app stub at "/"
    render(<Stub initialEntries={['/']} />);

    expect(screen.getByText('Mosaic')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'menu' })).toBeInTheDocument();

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'home Home' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'orders Orders' })).not.toBeInTheDocument();
  });

  it('should render successfully, find all the elements, and display the nav as a part of the layout - desktop view', async () => {
    global.innerWidth = 1024;

    const Stub = createRoutesStub([
      {
        path: '/',
        Component: Layout
      }
    ]);
    // render the app stub at "/"
    render(<Stub initialEntries={['/']} />);

    expect(screen.getByText('Mosaic')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'menu' })).not.toBeInTheDocument();

    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'home Home' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'orders Orders' })).toBeInTheDocument();
  });

  it('should toggle navbar by sliding it in and out when clicking the menu button - mobile view', async () => {
    global.innerWidth = 512;

    const Stub = createRoutesStub([
      {
        path: '/',
        Component: Layout
      }
    ]);
    // render the app stub at "/"
    render(<Stub initialEntries={['/']} />);

    let menuBtn = screen.getByRole('button', { name: 'menu' });
    let navBar = screen.queryByRole('menu');

    expect(menuBtn).toBeInTheDocument();
    expect(navBar).not.toBeInTheDocument();

    await user.click(menuBtn);

    navBar = screen.getByRole('menu');
    expect(navBar).toHaveClass('slide-in');

    await user.click(menuBtn);

    expect(navBar).toHaveClass('slide-out');

    await user.click(menuBtn);
    expect(navBar).toHaveClass('slide-in');
  });

  it('should toggle navbar by sliding it out when clicking outside it - mobile view', async () => {
    global.innerWidth = 512;

    const Stub = createRoutesStub([
      {
        path: '/',
        Component: Layout
      }
    ]);
    // render the app stub at "/"
    render(<Stub initialEntries={['/']} />);

    let menuBtn = screen.getByRole('button', { name: 'menu' });
    let navBar = screen.queryByRole('menu');

    expect(menuBtn).toBeInTheDocument();
    expect(navBar).not.toBeInTheDocument();

    await user.click(menuBtn);

    navBar = screen.getByRole('menu');
    expect(navBar).toHaveClass('slide-in');

    await user.click(document.body);

    expect(navBar).toHaveClass('slide-out');
  });

  it('should not affect the navbar when clicking outside it - desktop view', async () => {
    global.innerWidth = 1024;

    const Stub = createRoutesStub([
      {
        path: '/',
        Component: Layout
      }
    ]);
    // render the app stub at "/"
    render(<Stub initialEntries={['/']} />);

    let menuBtn = screen.queryByRole('button', { name: 'menu' });
    let navBar = screen.getByRole('menu');

    expect(menuBtn).not.toBeInTheDocument();
    expect(navBar).toBeInTheDocument();

    await user.click(document.body);

    navBar = screen.getByRole('menu');
    expect(navBar).toBeInTheDocument();
    expect(navBar).not.toHaveClass('slide-in');
    expect(navBar).not.toHaveClass('slide-out');
  });

  it("should keep the navbar's previous state in mobile view (close or open) when transitioning to mobile view again", async () => {
    global.innerWidth = 512;

    const Stub = createRoutesStub([
      {
        path: '/',
        Component: Layout
      }
    ]);
    // render the app stub at "/"
    render(<Stub initialEntries={['/']} />);

    let menuBtn = screen.getByRole('button', { name: 'menu' });
    let navBar = screen.queryByRole('menu');

    expect(menuBtn).toBeInTheDocument();
    expect(navBar).not.toBeInTheDocument();

    // open the nav
    await user.click(menuBtn);

    navBar = screen.getByRole('menu');
    expect(navBar).toHaveClass('slide-in');

    global.innerWidth = 1024;
    // dispatch the resize event
    fireEvent(window, new Event('resize'));
    expect(navBar).toBeInTheDocument();

    global.innerWidth = 512;
    // dispatch the resize event
    fireEvent(window, new Event('resize'));
    navBar = screen.queryByRole('menu');
    expect(navBar).toHaveClass('slide-in');
  });
});
