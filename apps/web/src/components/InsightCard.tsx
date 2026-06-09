import type { InsightTip, Category } from '../types/index.js';
import { categoryColor, formatCo2 } from '../utils/emissions.js';

const CATEGORY_ICONS: Record<Category, string> = {
  transport: '🚗',
  diet: '🥗',
  energy: '⚡',
  shopping: '🛍️',
};

interface InsightCardProps {
  tip: InsightTip;
  index: number;
}

export default function InsightCard({ tip, index }: InsightCardProps) {
  return (
    <article
      className="card-hover animate-slide-up"
      style={{ animationDelay: `${index * 100}ms` }}
      aria-label={`Insight tip: ${tip.title}`}
    >
      <div className="flex items-start gap-3">
        <span
          className="flex-shrink-0 text-2xl mt-0.5"
          aria-hidden="true"
        >
          {CATEGORY_ICONS[tip.category]}
        </span>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`text-xs font-semibold uppercase tracking-wide ${categoryColor(tip.category)}`}
              aria-label={`Category: ${tip.category}`}
            >
              {tip.category}
            </span>
            {tip.potentialSavingKg > 0 && (
              <span className="badge-green text-xs">
                Save ~{formatCo2(tip.potentialSavingKg)}/yr
              </span>
            )}
          </div>
          <h3 className="text-sm font-semibold text-gray-100 mb-1">{tip.title}</h3>
          <p className="text-xs text-gray-400 leading-relaxed">{tip.description}</p>
          {tip.actionUrl && (
            <a
              href={tip.actionUrl}
              className="mt-2 inline-block text-xs text-forest-400 hover:text-forest-300 underline"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Learn more about: ${tip.title}`}
            >
              Learn more →
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
