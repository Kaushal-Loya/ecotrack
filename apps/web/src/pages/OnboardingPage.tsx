import { useState, useId } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api.js';
import { EMISSION_COEFFICIENTS } from '../utils/emissions.js';

const STEPS = ['Transport', 'Diet', 'Energy', 'Shopping', 'Review'];

interface FormData {
  weeklyCarKm: number;
  weeklyBusKm: number;
  weeklyTrainKm: number;
  yearlyFlightKm: number;
  beefMealsPerWeek: number;
  otherMeatMealsPerWeek: number;
  vegetarianMealsPerWeek: number;
  monthlyElectricityKwh: number;
  monthlyGasKwh: number;
  monthlyClothingItems: number;
  monthlyOnlineOrders: number;
}

const DEFAULT_FORM: FormData = {
  weeklyCarKm: 0,
  weeklyBusKm: 0,
  weeklyTrainKm: 0,
  yearlyFlightKm: 0,
  beefMealsPerWeek: 0,
  otherMeatMealsPerWeek: 0,
  vegetarianMealsPerWeek: 0,
  monthlyElectricityKwh: 0,
  monthlyGasKwh: 0,
  monthlyClothingItems: 0,
  monthlyOnlineOrders: 0,
};

function NumericField({
  id,
  label,
  value,
  onChange,
  unit,
  placeholder,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (v: number) => void;
  unit: string;
  placeholder?: string;
}) {
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
}

export default function OnboardingPage() {
  const navigate = useNavigate();
  const formId = useId();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(DEFAULT_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update(field: keyof FormData, value: number): void {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function estimateTotal(): number {
    const W = 52;  // weeks per year
    const M = 12;  // months per year
    const c = EMISSION_COEFFICIENTS;
    return (
      form.weeklyCarKm * W * c.carPerKm +
      form.weeklyBusKm * W * c.busPerKm +
      form.weeklyTrainKm * W * c.trainPerKm +
      form.yearlyFlightKm * c.flightPerKm +
      form.beefMealsPerWeek * W * c.beefPerMeal +
      form.otherMeatMealsPerWeek * W * c.otherMeatPerMeal +
      form.vegetarianMealsPerWeek * W * c.vegetarianPerMeal +
      form.monthlyElectricityKwh * M * c.electricityPerKwh +
      form.monthlyGasKwh * M * c.naturalGasPerKwh +
      form.monthlyClothingItems * M * c.clothingPerItem +
      form.monthlyOnlineOrders * M * c.onlineOrderPerItem
    );
  }

  async function handleSubmit(): Promise<void> {
    setLoading(true);
    setError(null);
    try {
      await api.post('/footprint/calculate', form);
      navigate('/dashboard');
    } catch {
      setError('Failed to save your footprint. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const progressPercent = ((step) / (STEPS.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg animate-slide-up">
        <div className="text-center mb-6">
          <h1 className="font-display text-2xl font-bold text-gray-100">
            Calculate Your Footprint
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Answer a few questions to get your personalised carbon score
          </p>
        </div>

        {/* Progress stepper */}
        <nav aria-label="Onboarding steps" className="mb-6">
          <ol className="flex items-center justify-between" role="list">
            {STEPS.map((label, i) => (
              <li
                key={label}
                className="flex flex-col items-center gap-1"
                aria-current={i === step ? 'step' : undefined}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                    i < step
                      ? 'bg-forest-600 border-forest-600 text-white'
                      : i === step
                      ? 'bg-gray-900 border-forest-500 text-forest-400'
                      : 'bg-gray-900 border-gray-700 text-gray-600'
                  }`}
                >
                  {i < step ? '✓' : i + 1}
                </div>
                <span className={`text-xs hidden sm:block ${i === step ? 'text-forest-400' : 'text-gray-600'}`}>
                  {label}
                </span>
              </li>
            ))}
          </ol>
          {/* Progress bar */}
          <div className="mt-3 h-1 bg-gray-800 rounded-full overflow-hidden" aria-hidden="true">
            <div
              className="h-full bg-forest-500 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </nav>

        <div className="card">
          {/* Step 0: Transport */}
          {step === 0 && (
            <section aria-labelledby="transport-heading">
              <h2 id="transport-heading" className="text-base font-semibold text-gray-100 mb-4 flex items-center gap-2">
                <span aria-hidden="true">🚗</span> Transport
              </h2>
              <NumericField id={`${formId}-car`} label="Weekly car distance" value={form.weeklyCarKm} onChange={(v) => update('weeklyCarKm', v)} unit="km/week" />
              <NumericField id={`${formId}-bus`} label="Weekly bus distance" value={form.weeklyBusKm} onChange={(v) => update('weeklyBusKm', v)} unit="km/week" />
              <NumericField id={`${formId}-train`} label="Weekly train distance" value={form.weeklyTrainKm} onChange={(v) => update('weeklyTrainKm', v)} unit="km/week" />
              <NumericField id={`${formId}-flight`} label="Yearly flight distance" value={form.yearlyFlightKm} onChange={(v) => update('yearlyFlightKm', v)} unit="km/year" />
            </section>
          )}

          {/* Step 1: Diet */}
          {step === 1 && (
            <section aria-labelledby="diet-heading">
              <h2 id="diet-heading" className="text-base font-semibold text-gray-100 mb-4 flex items-center gap-2">
                <span aria-hidden="true">🥩</span> Diet
              </h2>
              <NumericField id={`${formId}-beef`} label="Beef meals per week" value={form.beefMealsPerWeek} onChange={(v) => update('beefMealsPerWeek', v)} unit="meals" />
              <NumericField id={`${formId}-meat`} label="Other meat meals per week" value={form.otherMeatMealsPerWeek} onChange={(v) => update('otherMeatMealsPerWeek', v)} unit="meals" />
              <NumericField id={`${formId}-veg`} label="Vegetarian/vegan meals per week" value={form.vegetarianMealsPerWeek} onChange={(v) => update('vegetarianMealsPerWeek', v)} unit="meals" />
            </section>
          )}

          {/* Step 2: Energy */}
          {step === 2 && (
            <section aria-labelledby="energy-heading">
              <h2 id="energy-heading" className="text-base font-semibold text-gray-100 mb-4 flex items-center gap-2">
                <span aria-hidden="true">⚡</span> Home Energy
              </h2>
              <NumericField id={`${formId}-elec`} label="Monthly electricity" value={form.monthlyElectricityKwh} onChange={(v) => update('monthlyElectricityKwh', v)} unit="kWh/month" placeholder="200" />
              <NumericField id={`${formId}-gas`} label="Monthly natural gas" value={form.monthlyGasKwh} onChange={(v) => update('monthlyGasKwh', v)} unit="kWh/month" placeholder="100" />
            </section>
          )}

          {/* Step 3: Shopping */}
          {step === 3 && (
            <section aria-labelledby="shopping-heading">
              <h2 id="shopping-heading" className="text-base font-semibold text-gray-100 mb-4 flex items-center gap-2">
                <span aria-hidden="true">🛍️</span> Shopping
              </h2>
              <NumericField id={`${formId}-clothing`} label="Monthly clothing items bought" value={form.monthlyClothingItems} onChange={(v) => update('monthlyClothingItems', v)} unit="items/month" />
              <NumericField id={`${formId}-orders`} label="Monthly online orders" value={form.monthlyOnlineOrders} onChange={(v) => update('monthlyOnlineOrders', v)} unit="orders/month" />
            </section>
          )}

          {/* Step 4: Review */}
          {step === 4 && (
            <section aria-labelledby="review-heading">
              <h2 id="review-heading" className="text-base font-semibold text-gray-100 mb-4">
                Review your estimate
              </h2>
              <div className="rounded-xl bg-gradient-to-br from-forest-900/40 to-gray-900 border border-forest-800 p-6 text-center mb-6">
                <p className="text-sm text-gray-400 mb-1">Estimated annual footprint</p>
                <p className="font-display text-4xl font-bold text-forest-400">
                  {(estimateTotal() / 1000).toFixed(1)}{' '}
                  <span className="text-2xl">t CO₂</span>
                </p>
                <p className="mt-2 text-xs text-gray-500">
                  Global average: 4.7 t CO₂/year
                </p>
              </div>
              {error && <p role="alert" className="error-msg mb-4">{error}</p>}
            </section>
          )}

          {/* Navigation buttons */}
          <div className="flex gap-3 mt-6">
            {step > 0 && (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="btn-secondary flex-1"
                type="button"
              >
                ← Back
              </button>
            )}
            {step < STEPS.length - 1 ? (
              <button
                onClick={() => setStep((s) => s + 1)}
                className="btn-primary flex-1"
                type="button"
              >
                Next →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="btn-primary flex-1"
                type="button"
                aria-busy={loading}
              >
                {loading ? 'Saving…' : '🌿 Save & View Dashboard'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
