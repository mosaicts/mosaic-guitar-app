import { createRoutesStub } from 'react-router';
import { expect, describe, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Forgot from '.';

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
    expect(screen.getByRole('button', { name: 'Send Verification Code' })).toBeInTheDocument();
  });
});
