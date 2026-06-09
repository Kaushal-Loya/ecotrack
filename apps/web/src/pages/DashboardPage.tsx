import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api.js';
import FootprintChart from '../components/FootprintChart.js';
import type { FootprintBreakdown } from '../types/index.js';
import { formatCo2, AVERAGE_FOOTPRINTS } from '../utils/emissions.js';
import { useAuth } from '../hooks/useAuth.js';

interface FootprintData {
  live: FootprintBreakdown;
  snapshot: FootprintBreakdown | null;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<FootprintData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get('/footprint')
      .then((res) => setData(res.data.data as FootprintData))
      .catch(() => setError('Failed to load footprint data'))
      .finally(() => setLoading(false));
  }, []);

  const comparison = useMemo(() => {
    if (!data) return null;
    const total = data.snapshot?.total ?? data.live.total;
    if (total === 0) return null;
    return {
      india: Math.round(((AVERAGE_FOOTPRINTS.India - total) / AVERAGE_FOOTPRINTS.India) * 100),
      world: Math.round(((AVERAGE_FOOTPRINTS.World - total) / AVERAGE_FOOTPRINTS.World) * 100),
    };
  }, [data]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64" role="status" aria-label="Loading dashboard">
        <div className="text-gray-400 animate-pulse">Loading your footprint…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div role="alert" className="card border-red-900 text-red-400 text-sm">
        {error}
      </div>
    );
  }

  const footprint = data?.snapshot ?? data?.live;
  const hasData = footprint && footprint.total > 0;

  return (
    <div className="animate-fade-in">
      {/* Page header */}
      <header className="mb-6">
        <h1 className="font-display text-2xl font-bold text-gray-100">
          Welcome back{user?.name ? `, ${user.name}` : ''}! 👋
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Here's your carbon footprint summary
        </p>
      </header>

      {!hasData ? (
        /* Empty state */
        <div className="card text-center py-12">
          <span className="text-5xl" aria-hidden="true">🌱</span>
          <h2 className="mt-4 font-semibold text-gray-100">No footprint data yet</h2>
          <p className="mt-2 text-sm text-gray-500 max-w-xs mx-auto">
            Complete the onboarding calculator to see your estimated CO₂ footprint
          </p>
          <Link
            to="/onboarding"
            id="start-onboarding-btn"
            className="btn-primary mt-6 inline-flex"
          >
            🌿 Calculate My Footprint
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Total score */}
          <section
            className="card lg:col-span-1 flex flex-col items-center justify-center text-center"
            aria-labelledby="total-score-heading"
          >
            <h2 id="total-score-heading" className="text-sm text-gray-400 mb-2">
              Annual CO₂ Footprint
            </h2>
            <p className="font-display text-5xl font-extrabold text-forest-400" aria-live="polite">
              {(footprint!.total / 1000).toFixed(1)}
              <span className="text-3xl text-forest-600">t</span>
            </p>
            <p className="text-xs text-gray-600 mt-1">tonnes CO₂ per year</p>

            {comparison && (
              <dl className="mt-6 grid grid-cols-2 gap-3 w-full">
                <div className="rounded-lg bg-gray-800 p-3">
                  <dt className="text-xs text-gray-500">vs India avg</dt>
                  <dd
                    className={`text-sm font-bold ${comparison.india > 0 ? 'text-forest-400' : 'text-red-400'}`}
                    aria-label={`${Math.abs(comparison.india)}% ${comparison.india > 0 ? 'below' : 'above'} India average`}
                  >
                    {comparison.india > 0 ? '↓' : '↑'} {Math.abs(comparison.india)}%
                  </dd>
                </div>
                <div className="rounded-lg bg-gray-800 p-3">
                  <dt className="text-xs text-gray-500">vs World avg</dt>
                  <dd
                    className={`text-sm font-bold ${comparison.world > 0 ? 'text-forest-400' : 'text-red-400'}`}
                    aria-label={`${Math.abs(comparison.world)}% ${comparison.world > 0 ? 'below' : 'above'} world average`}
                  >
                    {comparison.world > 0 ? '↓' : '↑'} {Math.abs(comparison.world)}%
                  </dd>
                </div>
              </dl>
            )}
          </section>

          {/* Pie chart */}
          <section
            className="card lg:col-span-2"
            aria-labelledby="breakdown-heading"
          >
            <h2 id="breakdown-heading" className="text-sm font-semibold text-gray-300 mb-4">
              Breakdown by Category
            </h2>
            <FootprintChart breakdown={footprint!} />
          </section>

          {/* Category summary cards */}
          <section
            className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-4 gap-4"
            aria-label="Emissions by category"
          >
            {(
              [
                { key: 'transport', icon: '🚗', label: 'Transport' },
                { key: 'diet', icon: '🥗', label: 'Diet' },
                { key: 'energy', icon: '⚡', label: 'Energy' },
                { key: 'shopping', icon: '🛍️', label: 'Shopping' },
              ] as const
            ).map(({ key, icon, label }) => (
              <div key={key} className="card text-center" aria-label={`${label}: ${formatCo2(footprint![key])}`}>
                <span className="text-2xl" aria-hidden="true">{icon}</span>
                <p className="mt-2 text-xs text-gray-500">{label}</p>
                <p className="text-lg font-bold text-gray-100 mt-1">
                  {formatCo2(footprint![key])}
                </p>
              </div>
            ))}
          </section>

          {/* Quick actions */}
          <nav
            className="lg:col-span-3 flex flex-wrap gap-3"
            aria-label="Quick actions"
          >
            <Link to="/activities" id="quick-log-activity" className="btn-secondary text-sm">
              + Log Activity
            </Link>
            <Link to="/insights" id="quick-view-insights" className="btn-secondary text-sm">
              💡 View Insights
            </Link>
            <Link to="/goals" id="quick-set-goal" className="btn-secondary text-sm">
              🎯 Set a Goal
            </Link>
          </nav>
        </div>
      )}
    </div>
  );
}
