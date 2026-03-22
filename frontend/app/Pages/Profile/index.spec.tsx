import { createRoutesStub } from 'react-router';
import { expect, describe, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Profile from '.';

describe('<Profile />', () => {
  const user = userEvent.setup();
  const fn = vi.fn();

  const username = 'testusr789';
  const firstName = 'Test';
  const lastName = 'User';
  const email = 'test@example.com';

  beforeEach(() => {
    const Stub = createRoutesStub([
      {
        path: '/profile',
        Component: Profile,
        loader() {
          return { firstName, lastName, username, email };
        }
      }
    ]);
    // render the app stub at "/"
    render(<Stub initialEntries={['/profile']} />);
  });

  it('should render successfully and find all the elements', async () => {
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
    });
  });
});
