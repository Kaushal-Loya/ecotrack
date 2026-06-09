import { useState, useId } from 'react';
import type { Category } from '../types/index.js';

const ACTIVITY_OPTIONS: Record<
  Category,
  { value: string; label: string; unit: string }[]
> = {
  transport: [
    { value: 'car_petrol', label: 'Petrol car', unit: 'km' },
    { value: 'car_diesel', label: 'Diesel car', unit: 'km' },
    { value: 'car_electric', label: 'Electric car', unit: 'km' },
    { value: 'bus', label: 'Bus', unit: 'km' },
    { value: 'train', label: 'Train', unit: 'km' },
    { value: 'flight_short', label: 'Short-haul flight', unit: 'km' },
    { value: 'flight_long', label: 'Long-haul flight', unit: 'km' },
    { value: 'motorbike', label: 'Motorbike', unit: 'km' },
  ],
  diet: [
    { value: 'beef', label: 'Beef meal', unit: 'meal' },
    { value: 'pork', label: 'Pork meal', unit: 'meal' },
    { value: 'chicken', label: 'Chicken meal', unit: 'meal' },
    { value: 'fish', label: 'Fish meal', unit: 'meal' },
    { value: 'vegetarian', label: 'Vegetarian meal', unit: 'meal' },
    { value: 'vegan', label: 'Vegan meal', unit: 'meal' },
  ],
  energy: [
    { value: 'electricity', label: 'Electricity', unit: 'kWh' },
    { value: 'natural_gas', label: 'Natural gas', unit: 'kWh' },
    { value: 'heating_oil', label: 'Heating oil', unit: 'litre' },
  ],
  shopping: [
    { value: 'clothing', label: 'Clothing item', unit: 'item' },
    { value: 'electronics', label: 'Electronics item', unit: 'item' },
    { value: 'online_order', label: 'Online order', unit: 'item' },
  ],
};

const CATEGORIES: { value: Category; label: string; icon: string }[] = [
  { value: 'transport', label: 'Transport', icon: '🚗' },
  { value: 'diet', label: 'Diet', icon: '🥗' },
  { value: 'energy', label: 'Energy', icon: '⚡' },
  { value: 'shopping', label: 'Shopping', icon: '🛍️' },
];

interface ActivityFormProps {
  onSubmit: (data: {
    category: Category;
    subtype: string;
    amount: number;
    unit: string;
    note?: string;
  }) => Promise<void>;
  loading?: boolean;
}

export default function ActivityForm({ onSubmit, loading = false }: ActivityFormProps) {
  const formId = useId();
  const [category, setCategory] = useState<Category>('transport');
  const [subtype, setSubtype] = useState('car_petrol');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  const options = ACTIVITY_OPTIONS[category];
  const selectedOption = options.find((o) => o.value === subtype) ?? options[0];

  function handleCategoryChange(cat: Category): void {
    setCategory(cat);
    setSubtype(ACTIVITY_OPTIONS[cat][0].value);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setError(null);

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid positive amount');
      return;
    }

    try {
      await onSubmit({
        category,
        subtype,
        amount: parsedAmount,
        unit: selectedOption.unit,
        note: note.trim() || undefined,
      });
      setAmount('');
      setNote('');
    } catch {
      setError('Failed to log activity. Please try again.');
    }
  }

  return (
    <form
      id={`${formId}-form`}
      onSubmit={handleSubmit}
      aria-label="Log a new activity"
      noValidate
    >
      {/* Category selector */}
      <fieldset className="mb-4">
        <legend className="label">Category</legend>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2" role="radiogroup">
          {CATEGORIES.map((cat) => (
            <label
              key={cat.value}
              className={`flex items-center gap-2 rounded-lg border p-3 cursor-pointer text-sm font-medium transition-all ${
                category === cat.value
                  ? 'border-forest-500 bg-forest-900/30 text-forest-300'
                  : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600'
              }`}
            >
              <input
                type="radio"
                name="category"
                value={cat.value}
                checked={category === cat.value}
                onChange={() => handleCategoryChange(cat.value)}
                className="sr-only"
              />
              <span aria-hidden="true">{cat.icon}</span>
              {cat.label}
            </label>
          ))}
        </div>
      </fieldset>

      {/* Activity type */}
      <div className="mb-4">
        <label htmlFor={`${formId}-subtype`} className="label">
          Activity type
        </label>
        <select
          id={`${formId}-subtype`}
          value={subtype}
          onChange={(e) => setSubtype(e.target.value)}
          className="input"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Amount */}
      <div className="mb-4">
        <label htmlFor={`${formId}-amount`} className="label">
          Amount ({selectedOption.unit})
        </label>
        <input
          id={`${formId}-amount`}
          type="number"
          min="0.01"
          step="any"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="input"
          placeholder={`e.g. ${selectedOption.unit === 'km' ? '20' : '1'}`}
          required
          aria-describedby={error ? `${formId}-error` : undefined}
        />
      </div>

      {/* Optional note */}
      <div className="mb-4">
        <label htmlFor={`${formId}-note`} className="label">
          Note <span className="text-gray-600">(optional)</span>
        </label>
        <input
          id={`${formId}-note`}
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="input"
          placeholder="e.g. Morning commute"
          maxLength={500}
        />
      </div>

      {error && (
        <p id={`${formId}-error`} role="alert" className="error-msg mb-3">
          {error}
        </p>
      )}

      <button
        type="submit"
        id="log-activity-btn"
        disabled={loading}
        className="btn-primary w-full"
        aria-busy={loading}
      >
        {loading ? (
          <>
            <span className="animate-spin" aria-hidden="true">⟳</span>
            Logging…
          </>
        ) : (
          '+ Log Activity'
        )}
      </button>
    </form>
  );
}
