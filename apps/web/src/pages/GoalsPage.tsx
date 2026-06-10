import { useEffect, useState, useId, useCallback } from 'react';
import { api } from '../utils/api.js';
import GoalCard from '../components/GoalCard.js';
import ConfirmModal from '../components/ConfirmModal.js';
import type { Goal } from '../types/index.js';

interface NewGoalForm {
  title: string;
  targetKg: string;
  baselineKg: string;
  deadline: string;
}

const EMPTY_FORM: NewGoalForm = { title: '', targetKg: '', baselineKg: '', deadline: '' };

export default function GoalsPage() {
  const formId = useId();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<NewGoalForm>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const fetchGoals = useCallback((): void => {
    setLoading(true);
    api
      .get('/goals')
      .then((res) => setGoals(res.data.data as Goal[]))
      .catch(() => setError('Failed to load goals'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  async function handleCreate(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setFormError(null);

    const targetKg = parseFloat(form.targetKg);
    const baselineKg = parseFloat(form.baselineKg);

    if (isNaN(targetKg) || isNaN(baselineKg) || targetKg <= 0 || baselineKg <= 0) {
      setFormError('Please enter valid positive numbers');
      return;
    }
    if (targetKg >= baselineKg) {
      setFormError('Target must be less than baseline');
      return;
    }
    if (!form.deadline) {
      setFormError('Please set a deadline');
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await api.post('/goals', {
        title: form.title,
        targetKg,
        baselineKg,
        deadline: new Date(form.deadline).toISOString(),
      });
      setGoals((prev) => [data.data as Goal, ...prev]);
      setForm(EMPTY_FORM);
      setShowForm(false);
    } catch {
      setFormError('Failed to create goal. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/goals/${deleteTarget}`);
      setGoals((prev) => prev.filter((g) => g.id !== deleteTarget));
    } catch {
      setError('Failed to delete goal');
    }
    setDeleteTarget(null);
  }, [deleteTarget]);

  const handleDeleteCancel = useCallback(() => {
    setDeleteTarget(null);
  }, []);

  const minDeadline = new Date();
  minDeadline.setDate(minDeadline.getDate() + 1);

  return (
    <div className="animate-fade-in">
      <header className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-100">🎯 Goals</h1>
          <p className="text-sm text-gray-500 mt-1">Set CO₂ reduction targets and track your progress</p>
        </div>
        <button
          id="create-goal-btn"
          onClick={() => setShowForm(!showForm)}
          className="btn-primary flex-shrink-0"
          aria-expanded={showForm}
          aria-controls="create-goal-form"
        >
          {showForm ? '✕ Cancel' : '+ New Goal'}
        </button>
      </header>

      {/* Create goal form */}
      {showForm && (
        <section
          id="create-goal-form"
          className="card mb-6 animate-slide-up"
          aria-labelledby="new-goal-heading"
        >
          <h2 id="new-goal-heading" className="text-sm font-semibold text-gray-300 mb-4">
            Create New Goal
          </h2>
          <form onSubmit={handleCreate} noValidate aria-label="Create a new reduction goal">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor={`${formId}-title`} className="label">Goal title</label>
                <input
                  id={`${formId}-title`}
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className="input"
                  placeholder="e.g. Reduce transport by 20%"
                  required
                  maxLength={200}
                />
              </div>
              <div>
                <label htmlFor={`${formId}-baseline`} className="label">Baseline (kg CO₂/year)</label>
                <input
                  id={`${formId}-baseline`}
                  type="number"
                  min="1"
                  step="any"
                  value={form.baselineKg}
                  onChange={(e) => setForm((f) => ({ ...f, baselineKg: e.target.value }))}
                  className="input"
                  placeholder="e.g. 5000"
                  required
                />
              </div>
              <div>
                <label htmlFor={`${formId}-target`} className="label">Target (kg CO₂/year)</label>
                <input
                  id={`${formId}-target`}
                  type="number"
                  min="1"
                  step="any"
                  value={form.targetKg}
                  onChange={(e) => setForm((f) => ({ ...f, targetKg: e.target.value }))}
                  className="input"
                  placeholder="e.g. 4000"
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor={`${formId}-deadline`} className="label">Deadline</label>
                <input
                  id={`${formId}-deadline`}
                  type="date"
                  value={form.deadline}
                  min={minDeadline.toISOString().split('T')[0]}
                  onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))}
                  className="input"
                  required
                />
              </div>
            </div>

            {formError && (
              <p role="alert" className="error-msg mt-3">{formError}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary mt-4"
              aria-busy={submitting}
            >
              {submitting ? 'Creating…' : '🎯 Create Goal'}
            </button>
          </form>
        </section>
      )}

      {error && <p role="alert" className="text-sm text-red-400 mb-4">{error}</p>}

      {loading ? (
        <div className="space-y-4" aria-busy="true" aria-label="Loading goals">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-44 rounded-2xl bg-gray-800 animate-pulse" />
          ))}
        </div>
      ) : goals.length === 0 ? (
        <div className="card text-center py-12">
          <span className="text-4xl" aria-hidden="true">🎯</span>
          <h2 className="mt-4 font-semibold text-gray-100">No goals yet</h2>
          <p className="mt-2 text-sm text-gray-500">
            Set a CO₂ reduction target and we'll track your progress automatically
          </p>
        </div>
      ) : (
        <section aria-label="Your reduction goals">
          <ul className="space-y-4" role="list">
            {goals.map((goal) => (
              <li key={goal.id}>
                <GoalCard goal={goal} onDelete={(id) => setDeleteTarget(id)} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <ConfirmModal
        open={deleteTarget !== null}
        title="Delete goal"
        message="Are you sure you want to delete this goal? This action cannot be undone."
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </div>
  );
}
