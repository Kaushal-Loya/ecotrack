import { useEffect, useState } from 'react';
import ActivityForm from '../components/ActivityForm.js';
import { useActivities } from '../hooks/useActivities.js';
import type { Category } from '../types/index.js';
import { formatCo2, CATEGORY_LABELS, toDateString } from '../utils/emissions.js';

const RANGES = ['week', 'month', 'year', 'all'] as const;
type Range = (typeof RANGES)[number];

export default function ActivitiesPage() {
  const { activities, meta, loading, error, fetchActivities, logActivity, deleteActivity } =
    useActivities();
  const [range, setRange] = useState<Range>('month');
  const [logLoading, setLogLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    void fetchActivities({ range });
  }, [range, fetchActivities]);

  async function handleLog(data: {
    category: Category;
    subtype: string;
    amount: number;
    unit: string;
    note?: string;
  }): Promise<void> {
    setLogLoading(true);
    setSuccessMsg(null);
    const result = await logActivity(data);
    if (result) {
      setSuccessMsg(`Logged ${formatCo2(result.co2Kg)} for ${CATEGORY_LABELS[result.category as Category]}`);
      setTimeout(() => setSuccessMsg(null), 4000);
    }
    setLogLoading(false);
  }

  async function handleDelete(id: string): Promise<void> {
    if (!confirm('Delete this activity log?')) return;
    await deleteActivity(id);
  }

  return (
    <div className="animate-fade-in">
      <header className="mb-6">
        <h1 className="font-display text-2xl font-bold text-gray-100">Activity Log</h1>
        <p className="text-sm text-gray-500 mt-1">
          Log your daily activities to track your carbon footprint in real time
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Log form */}
        <section className="lg:col-span-2 card" aria-labelledby="log-form-heading">
          <h2 id="log-form-heading" className="text-sm font-semibold text-gray-300 mb-4">
            Log New Activity
          </h2>

          {successMsg && (
            <div
              role="status"
              aria-live="polite"
              className="mb-4 rounded-lg bg-forest-900/40 border border-forest-800 px-4 py-2 text-sm text-forest-300"
            >
              ✓ {successMsg}
            </div>
          )}

          <ActivityForm onSubmit={handleLog} loading={logLoading} />
        </section>

        {/* Activity list */}
        <section className="lg:col-span-3" aria-labelledby="activity-list-heading">
          <div className="flex items-center justify-between mb-4 gap-4">
            <h2 id="activity-list-heading" className="text-sm font-semibold text-gray-300">
              Recent Activities{' '}
              {meta && (
                <span className="text-gray-600 font-normal">({meta.total} total)</span>
              )}
            </h2>

            {/* Range filter */}
            <div className="flex rounded-lg overflow-hidden border border-gray-700" role="group" aria-label="Filter by date range">
              {RANGES.map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                    range === r
                      ? 'bg-forest-800 text-forest-300'
                      : 'bg-gray-800 text-gray-500 hover:bg-gray-700'
                  }`}
                  aria-pressed={range === r}
                  aria-label={`Filter by ${r}`}
                >
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-400 mb-4">
              {error}
            </p>
          )}

          {loading ? (
            <div className="space-y-3" aria-busy="true" aria-label="Loading activities">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-16 rounded-xl bg-gray-800 animate-pulse" />
              ))}
            </div>
          ) : activities.length === 0 ? (
            <div className="card text-center py-10 text-gray-500 text-sm">
              No activities logged in this period.
            </div>
          ) : (
            <ul className="space-y-3" aria-label="Activity list">
              {activities.map((activity) => (
                <li
                  key={activity.id}
                  className="card-hover flex items-center gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        {CATEGORY_LABELS[activity.category as Category]}
                      </span>
                      <span className="text-xs text-gray-600">·</span>
                      <span className="text-xs text-gray-500">{activity.subtype.replace(/_/g, ' ')}</span>
                    </div>
                    <p className="text-sm font-medium text-gray-100 mt-0.5">
                      {activity.amount} {activity.unit}
                    </p>
                    {activity.note && (
                      <p className="text-xs text-gray-600 truncate">{activity.note}</p>
                    )}
                    <p className="text-xs text-gray-600 mt-0.5">{toDateString(activity.loggedAt)}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span
                      className="text-sm font-bold text-forest-400"
                      aria-label={`${formatCo2(activity.co2Kg)} of CO₂`}
                    >
                      {formatCo2(activity.co2Kg)}
                    </span>
                    <button
                      onClick={() => handleDelete(activity.id)}
                      className="text-gray-700 hover:text-red-400 text-xs transition-colors"
                      aria-label={`Delete activity logged on ${toDateString(activity.loggedAt)}`}
                    >
                      ✕
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
