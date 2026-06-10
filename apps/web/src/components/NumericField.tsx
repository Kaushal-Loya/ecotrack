import { memo } from 'react';

interface NumericFieldProps {
  id: string;
  label: string;
  value: number;
  onChange: (v: number) => void;
  unit: string;
  placeholder?: string;
}

const NumericField = memo(function NumericField({
  id,
  label,
  value,
  onChange,
  unit,
  placeholder,
}: NumericFieldProps) {
  return (
    <div className="mb-4">
      <label htmlFor={id} className="label">
        {label}{' '}
        <span className="text-gray-600 font-normal">({unit})</span>
      </label>
      <input
        id={id}
        type="number"
        min="0"
        step="any"
        value={value || ''}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className="input"
        placeholder={placeholder ?? '0'}
      />
    </div>
  );
});

export default NumericField;
