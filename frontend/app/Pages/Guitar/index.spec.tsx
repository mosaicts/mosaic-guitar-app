import { createRoutesStub } from 'react-router';
import { expect, describe, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Guitar from '.';
import Home from '../Home';

describe('<Guitar />', () => {
  const user = userEvent.setup();

  beforeEach(() => {
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
        path: '/guitars/1',
        Component: Guitar,
        loader() {
          return {
            id: 1,
            name: 'Dune Guitar',
            image: '/example-guitar-dune.jpg',
            description:
              'Inspired by the desert, this guitar will transport you to a world of sand and adventure.',
            shortDescription:
              'A desert-inspired hollow body guitar with warm tones and custom desert glyph inlays.',
            price: 599
          };
        }
      }
    ]);
    // render the app stub at "/"
    render(<Stub initialEntries={['/guitars/1']} />);
  });

  it('should render successfully and find all the elements', async () => {
    await waitFor(() => {
      expect(screen.getByText('Dune Guitar')).toBeInTheDocument();
      const addBtn = screen.getByRole('button', { name: 'Add to Cart' });
      expect(addBtn).toBeInTheDocument();
      expect(addBtn).toBeEnabled();
      expect(screen.getByRole('link', { name: '← Back to all guitars' })).toBeInTheDocument();
      expect(screen.getByText('$599')).toBeInTheDocument();
    });
  });

  it('should display a modal for some time then it disappears', async () => {
    const addBtn = await screen.findByRole('button', { name: 'Add to Cart' });

    await user.click(addBtn);

    expect(screen.getByText('Item added')).toBeInTheDocument();

    waitFor(() => {
      expect(screen.queryByText('Item added')).not.toBeInTheDocument();
      expect(screen.findByRole('button', { name: 'Add to Cart' })).toBeInTheDocument();
    });
  });

  it('should navigate to Home after clicking the back button', async () => {
    const backLink = await screen.findByRole('link', { name: '← Back to all guitars' });

    await user.click(backLink);

    expect(screen.getByText('Featured Guitars')).toBeInTheDocument();
    expect(screen.getAllByText('View Details')).toHaveLength(2);
  });
});
