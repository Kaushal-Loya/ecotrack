import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ActivityForm from '../components/ActivityForm.js';

describe('ActivityForm', () => {
  it('renders all form elements', () => {
    render(<ActivityForm onSubmit={vi.fn()} />);
    expect(screen.getByRole('form')).toBeInTheDocument();
    expect(screen.getByLabelText(/activity type/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /log activity/i })).toBeInTheDocument();
  });

  it('shows validation error if amount is empty or 0', async () => {
    render(<ActivityForm onSubmit={vi.fn()} />);
    const submitBtn = screen.getByRole('button', { name: /log activity/i });
    await userEvent.click(submitBtn);
    expect(await screen.findByRole('alert')).toBeInTheDocument();
  });

  it('calls onSubmit with correct data when form is valid', async () => {
    const mockSubmit = vi.fn().mockResolvedValue(undefined);
    render(<ActivityForm onSubmit={mockSubmit} />);

    const amountInput = screen.getByLabelText(/amount/i);
    await userEvent.type(amountInput, '50');
    await userEvent.click(screen.getByRole('button', { name: /log activity/i }));

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ amount: 50 })
      );
    });
  });

  it('changes unit label when category changes', async () => {
    render(<ActivityForm onSubmit={vi.fn()} />);
    // Switch to diet category
    const dietRadio = screen.getByRole('radio', { name: /diet/i });
    await userEvent.click(dietRadio);
    // The Amount label should show 'meal' as the unit
    const amountLabel = screen.getByText((text, element) => {
      return element?.tagName === 'LABEL' && /amount/i.test(text) && /meal/i.test(text);
    });
    expect(amountLabel).toBeInTheDocument();
  });

  it('disables submit button when loading', () => {
    render(<ActivityForm onSubmit={vi.fn()} loading={true} />);
    expect(screen.getByRole('button', { name: /logging/i })).toBeDisabled();
  });

  it('clears amount field after successful submission', async () => {
    const mockSubmit = vi.fn().mockResolvedValue(undefined);
    render(<ActivityForm onSubmit={mockSubmit} />);

    const amountInput = screen.getByLabelText(/amount/i);
    await userEvent.type(amountInput, '100');
    await userEvent.click(screen.getByRole('button', { name: /log activity/i }));

    await waitFor(() => {
      expect(amountInput).toHaveValue(null);
    });
  });
});
