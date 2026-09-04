import { render, screen } from '@testing-library/react';
import { EmptyState, ErrorState, Loading } from './States';

describe('state components', () => {
  it('announces loading', () => {
    render(<Loading label="Fetching pets" />);
    expect(screen.getByRole('status')).toHaveTextContent('Fetching pets');
  });
  it('presents empty-state guidance', () => {
    render(<EmptyState title="No pets" message="Add your first companion." action={<button>Add pet</button>} />);
    expect(screen.getByRole('heading', { name: 'No pets' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add pet' })).toBeInTheDocument();
  });
  it('exposes errors to assistive technology', () => {
    render(<ErrorState error={new Error('Network unavailable')} />);
    expect(screen.getByRole('alert')).toHaveTextContent('Network unavailable');
  });
});
