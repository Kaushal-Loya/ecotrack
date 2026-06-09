import { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { FootprintBreakdown } from '../types/index.js';
import type { Category } from '../types/index.js';
import { categoryHex, CATEGORY_LABELS, formatCo2 } from '../utils/emissions.js';

interface FootprintChartProps {
  breakdown: FootprintBreakdown;
}

interface ChartEntry {
  name: string;
  value: number;
  category: Category;
}

export default function FootprintChart({ breakdown }: FootprintChartProps) {
  const data = useMemo<ChartEntry[]>(() => {
    const entries: [Category, number][] = [
      ['transport', breakdown.transport],
      ['diet', breakdown.diet],
      ['energy', breakdown.energy],
      ['shopping', breakdown.shopping],
    ];
    return entries
      .filter(([, v]) => v > 0)
      .map(([cat, val]) => ({
        name: CATEGORY_LABELS[cat],
        value: val,
        category: cat,
      }));
  }, [breakdown]);

  if (data.length === 0) {
    return (
      <div
        className="flex items-center justify-center h-48 text-gray-500 text-sm"
        role="status"
        aria-label="No footprint data yet"
      >
        No data to display yet
      </div>
    );
  }

  return (
    <figure aria-label="Carbon footprint breakdown pie chart">
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={110}
            paddingAngle={3}
            dataKey="value"
            aria-label="Pie chart showing CO₂ by category"
          >
            {data.map((entry) => (
              <Cell
                key={entry.category}
                fill={categoryHex(entry.category)}
                stroke="transparent"
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: '#111827',
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#f3f4f6',
            }}
            formatter={(value: number) => [formatCo2(value), 'CO₂']}
          />
          <Legend
            formatter={(value) => (
              <span className="text-xs text-gray-300">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Accessible data table fallback */}
      <details className="mt-2">
        <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-400">
          View as table
        </summary>
        <table className="mt-2 w-full text-xs text-gray-400">
          <caption className="sr-only">Carbon footprint breakdown by category</caption>
          <thead>
            <tr>
              <th scope="col" className="text-left py-1">Category</th>
              <th scope="col" className="text-right py-1">CO₂ (kg/year)</th>
              <th scope="col" className="text-right py-1">Share</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.category} className="border-t border-gray-800">
                <td className="py-1">{row.name}</td>
                <td className="text-right py-1">{row.value.toFixed(1)}</td>
                <td className="text-right py-1">
                  {breakdown.total > 0
                    ? `${Math.round((row.value / breakdown.total) * 100)}%`
                    : '—'}
                </td>
              </tr>
            ))}
            <tr className="border-t border-gray-700 font-semibold text-gray-200">
              <td className="py-1">Total</td>
              <td className="text-right py-1">{breakdown.total.toFixed(1)}</td>
              <td className="text-right py-1">100%</td>
            </tr>
          </tbody>
        </table>
      </details>
    </figure>
  );
}
