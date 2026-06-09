import { useEffect, useState } from 'react';
import { api } from '../utils/api.js';
import InsightCard from '../components/InsightCard.js';
import type { InsightTip } from '../types/index.js';

export default function InsightsPage() {
  const [tips, setTips] = useState<InsightTip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get('/insights')
      .then((res) => setTips(res.data.data as InsightTip[]))
      .catch(() => setError('Failed to load insights'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="animate-fade-in">
      <header className="mb-6">
        <h1 className="font-display text-2xl font-bold text-gray-100">
          💡 Personalised Insights
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Tips tailored to your biggest emission sources
        </p>
      </header>

      {error && (
        <p role="alert" className="text-sm text-red-400 card border-red-900 mb-6">
          {error}
        </p>
      )}

      {loading ? (
        <div className="space-y-4" aria-busy="true" aria-label="Loading insights">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-gray-800 animate-pulse" />
          ))}
        </div>
      ) : tips.length === 0 ? (
        <div className="card text-center py-12">
          <span className="text-4xl" aria-hidden="true">🌱</span>
          <h2 className="mt-4 font-semibold text-gray-100">
            Log some activities to get insights
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            We'll generate personalised tips based on your biggest emission categories
          </p>
        </div>
      ) : (
        <section aria-label="Your personalised tips">
          <ul className="space-y-4" role="list">
            {tips.map((tip, i) => (
              <li key={`${tip.category}-${i}`}>
                <InsightCard tip={tip} index={i} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* General sustainability resources */}
      <section className="mt-8" aria-labelledby="resources-heading">
        <h2 id="resources-heading" className="text-sm font-semibold text-gray-300 mb-3">
          Further reading
        </h2>
        <ul className="space-y-2" role="list">
          {[
            { title: 'Project Drawdown — Solutions', url: 'https://drawdown.org/solutions' },
            { title: 'Our World in Data — CO₂ Emissions', url: 'https://ourworldindata.org/co2-emissions' },
            { title: 'UN Act Now — Carbon Calculator', url: 'https://www.un.org/actnow' },
          ].map((link) => (
            <li key={link.url}>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-forest-400 transition-colors"
              >
                <span aria-hidden="true">→</span>
                {link.title}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
