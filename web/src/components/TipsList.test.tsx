import { render, screen } from '@testing-library/react';
import { TipsList } from './TipsList';

it('renders wellness advice', () => {
  render(<TipsList tips={[{ kind: 'activity', severity: 'attention', message: 'Add a gentle walk.' }]} />);
  expect(screen.getByRole('list', { name: 'Wellness tips' })).toHaveTextContent('Add a gentle walk.');
});
