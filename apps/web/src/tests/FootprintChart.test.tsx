import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import FootprintChart from '../components/FootprintChart.js';

const sampleBreakdown = {
  transport: 2000,
  diet: 1500,
  energy: 800,
  shopping: 400,
  total: 4700,
};

describe('FootprintChart', () => {
  it('renders the accessible data table', () => {
    render(<FootprintChart breakdown={sampleBreakdown} />);
    // The figure should exist
    expect(screen.getByRole('figure')).toBeInTheDocument();
  });

  it('shows "No data" message when all values are 0', () => {
    const empty = { transport: 0, diet: 0, energy: 0, shopping: 0, total: 0 };
    render(<FootprintChart breakdown={empty} />);
    expect(screen.getByText(/no data to display/i)).toBeInTheDocument();
  });

  it('renders a fallback "View as table" toggle', () => {
    render(<FootprintChart breakdown={sampleBreakdown} />);
    expect(screen.getByText(/view as table/i)).toBeInTheDocument();
  });

  it('table has correct caption for screen readers', () => {
    render(<FootprintChart breakdown={sampleBreakdown} />);
    // Find the table caption in the DOM (inside details, hidden by default)
    const caption = document.querySelector('caption');
    expect(caption).toBeTruthy();
    expect(caption?.textContent).toMatch(/Carbon footprint breakdown/i);
  });
});
