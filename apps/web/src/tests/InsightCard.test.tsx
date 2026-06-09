import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import InsightCard from '../components/InsightCard.js';

const sampleTip = {
  category: 'transport' as const,
  title: 'Switch to public transit',
  description: 'Taking the bus or train instead of driving can cut emissions.',
  potentialSavingKg: 120,
};

describe('InsightCard', () => {
  it('renders tip title and description', () => {
    render(<InsightCard tip={sampleTip} index={0} />);
    expect(screen.getByText('Switch to public transit')).toBeInTheDocument();
    expect(screen.getByText(/cut emissions/i)).toBeInTheDocument();
  });

  it('shows potential saving badge', () => {
    render(<InsightCard tip={sampleTip} index={0} />);
    expect(screen.getByText(/save/i)).toBeInTheDocument();
    expect(screen.getByText(/120/)).toBeInTheDocument();
  });

  it('renders a link when actionUrl is provided', () => {
    const tipWithUrl = { ...sampleTip, actionUrl: 'https://example.com' };
    render(<InsightCard tip={tipWithUrl} index={0} />);
    const link = screen.getByRole('link', { name: /learn more/i });
    expect(link).toHaveAttribute('href', 'https://example.com');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
