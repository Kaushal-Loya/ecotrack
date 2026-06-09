import type { Goal } from '../types/index.js';
import { formatCo2, toDateString } from '../utils/emissions.js';

interface GoalCardProps {
  goal: Goal;
  onDelete?: (id: string) => void;
}

const MILESTONES = [25, 50, 75, 100];

export default function GoalCard({ goal, onDelete }: GoalCardProps) {
  const isPastDeadline = new Date(goal.deadline) < new Date() && !goal.achieved;

  return (
    <article
      className={`card animate-slide-up ${goal.achieved ? 'border-forest-700' : isPastDeadline ? 'border-red-900' : ''}`}
      aria-label={`Goal: ${goal.title}`}
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h3 className="font-semibold text-gray-100">{goal.title}</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Deadline: {toDateString(goal.deadline)}
            {isPastDeadline && (
              <span className="ml-1 text-red-400" role="status">
                (overdue)
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {goal.achieved && (
            <span className="badge-green" role="status" aria-label="Goal achieved">
              ✓ Achieved
            </span>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(goal.id)}
              className="text-gray-600 hover:text-red-400 text-xs transition-colors"
              aria-label={`Delete goal: ${goal.title}`}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <dl className="grid grid-cols-3 gap-3 mb-4 text-center">
        <div className="rounded-lg bg-gray-800 p-2">
          <dt className="text-xs text-gray-500 mb-1">Baseline</dt>
          <dd className="text-sm font-semibold text-gray-100">{formatCo2(goal.baselineKg)}</dd>
        </div>
        <div className="rounded-lg bg-gray-800 p-2">
          <dt className="text-xs text-gray-500 mb-1">Target</dt>
          <dd className="text-sm font-semibold text-forest-400">{formatCo2(goal.targetKg)}</dd>
        </div>
        <div className="rounded-lg bg-gray-800 p-2">
          <dt className="text-xs text-gray-500 mb-1">Current</dt>
          <dd className="text-sm font-semibold text-gray-100">{formatCo2(goal.currentKg)}</dd>
        </div>
      </dl>

      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-xs text-gray-500 mb-1.5">
          <span>Progress</span>
          <span
            aria-live="polite"
            aria-label={`${goal.progressPercent}% complete`}
          >
            {goal.progressPercent}%
          </span>
        </div>
        <div
          className="h-2.5 rounded-full bg-gray-800 overflow-hidden"
          role="progressbar"
          aria-valuenow={goal.progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${goal.title}: ${goal.progressPercent}% complete`}
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-forest-600 to-forest-400 transition-all duration-700 animate-progress"
            style={{ width: `${goal.progressPercent}%` }}
          />
        </div>

        {/* Milestone markers */}
        <div className="relative mt-1 flex justify-between" aria-hidden="true">
          {MILESTONES.map((m) => (
            <div
              key={m}
              className={`text-xs ${goal.progressPercent >= m ? 'text-forest-400' : 'text-gray-700'}`}
            >
              {m === 100 ? '🏆' : `${m}%`}
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}
