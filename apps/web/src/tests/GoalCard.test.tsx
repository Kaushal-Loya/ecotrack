import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GoalCard from '../components/GoalCard.js';

const sampleGoal = {
  id: 'goal-1',
  userId: 'user-1',
  title: 'Reduce transport by 20%',
  targetKg: 2000,
  baselineKg: 3000,
  deadline: '2025-12-31',
  achieved: false,
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
  currentKg: 2500,
  progressPercent: 50,
};

describe('GoalCard', () => {
  it('renders goal title and stats', () => {
    render(<GoalCard goal={sampleGoal} />);
    expect(screen.getByText('Reduce transport by 20%')).toBeInTheDocument();
    expect(screen.getByText(/3\.0 t CO₂/)).toBeInTheDocument();
    expect(screen.getByText(/2\.0 t CO₂/)).toBeInTheDocument();
  });

  it('renders progress bar with correct aria attributes', () => {
    render(<GoalCard goal={sampleGoal} />);
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuenow', '50');
    expect(progressbar).toHaveAttribute('aria-valuemin', '0');
    expect(progressbar).toHaveAttribute('aria-valuemax', '100');
  });

  it('shows achieved badge when goal is achieved', () => {
    render(<GoalCard goal={{ ...sampleGoal, achieved: true, progressPercent: 100 }} />);
    expect(screen.getByText(/achieved/i)).toBeInTheDocument();
  });

  it('calls onDelete when delete button is clicked', async () => {
    const onDelete = vi.fn();
    render(<GoalCard goal={sampleGoal} onDelete={onDelete} />);
    const deleteBtn = screen.getByLabelText(/delete goal/i);
    await userEvent.click(deleteBtn);
    expect(onDelete).toHaveBeenCalledWith('goal-1');
  });
});
