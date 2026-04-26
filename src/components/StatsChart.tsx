/**
 * components/StatsChart.tsx
 *
 * Reusable chart built on Recharts.
 * Works identically on both the admin dashboard and the user dashboard —
 * just pass a different fetcher URL and which series to show.
 *
 * Usage (admin):
 *   <StatsChart
 *     title="Platform Activity"
 *     fetchUrl="/admin/stats/daily"
 *     series={['completed_count', 'transaction_count', 'total_volume_usd']}
 *   />
 *
 * Usage (user):
 *   <StatsChart
 *     title="Your Activity"
 *     fetchUrl="/stats/my"
 *     series={['completed_count', 'total_volume_usd']}
 *   />
 */

import * as React from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { Loader2, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import api from '@/lib/axios'

// ── Types ─────────────────────────────────────────────────────────────────

export type SeriesKey =
  | 'transaction_count'
  | 'completed_count'
  | 'failed_count'
  | 'total_volume_usd'
  | 'total_volume_ghs'
  | 'new_users'

interface SeriesConfig {
  key:   SeriesKey
  label: string
  color: string
  unit?: string         // shown in tooltip
  format?: (v: number) => string
}

// ── Series definitions ─────────────────────────────────────────────────────

const SERIES_CONFIGS: Record<SeriesKey, SeriesConfig> = {
  transaction_count: {
    key:    'transaction_count',
    label:  'Transactions',
    color:  '#3b82f6',
    format: (v) => v.toLocaleString(),
  },
  completed_count: {
    key:    'completed_count',
    label:  'Completed',
    color:  '#10b981',
    format: (v) => v.toLocaleString(),
  },
  failed_count: {
    key:    'failed_count',
    label:  'Failed',
    color:  '#ef4444',
    format: (v) => v.toLocaleString(),
  },
  total_volume_usd: {
    key:    'total_volume_usd',
    label:  'Volume (USD)',
    color:  '#f59e0b',
    unit:   '$',
    format: (v) => `$${v.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  },
  total_volume_ghs: {
    key:    'total_volume_ghs',
    label:  'Volume (GHS)',
    color:  '#8b5cf6',
    unit:   '₵',
    format: (v) => `₵${v.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  },
  new_users: {
    key:    'new_users',
    label:  'New Users',
    color:  '#06b6d4',
    format: (v) => v.toLocaleString(),
  },
}

// ── Custom tooltip ─────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label, configs }: any) {
  if (!active || !payload?.length) return null

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 shadow-2xl">
      <p className="text-xs text-slate-400 mb-2 font-medium">
        {label ? formatDate(label) : ''}
      </p>
      {payload.map((entry: any) => {
        const cfg = configs[entry.dataKey] as SeriesConfig | undefined
        return (
          <div key={entry.dataKey} className="flex items-center gap-2 mb-1 last:mb-0">
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: entry.color }} />
            <span className="text-xs text-slate-400">{cfg?.label ?? entry.dataKey}:</span>
            <span className="text-xs font-semibold text-white">
              {cfg?.format ? cfg.format(entry.value) : entry.value}
            </span>
          </div>
        )
      })}
    </div>
  )
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en', {
      month: 'short', day: 'numeric',
    })
  } catch { return dateStr }
}

// ── Day range selector ─────────────────────────────────────────────────────

const DAY_OPTIONS = [7, 14, 30, 90] as const

// ── Main component ─────────────────────────────────────────────────────────

interface StatsChartProps {
  title:       string
  fetchUrl:    string
  series:      SeriesKey[]
  /** Which axis to put volume series on (right Y axis). Default: right. */
  volumeOnRight?: boolean
  className?:  string
  defaultDays?: 7 | 14 | 30 | 90
}

export function StatsChart({
  title,
  fetchUrl,
  series,
  volumeOnRight = true,
  className,
  defaultDays = 30,
}: StatsChartProps) {
  const [days, setDays] = React.useState<number>(defaultDays)

  const { data, isLoading, isError } = useQuery({
    queryKey:  [fetchUrl, days],
    queryFn:   () => api.get(fetchUrl, { params: { days } }).then((r) => r.data.data),
    staleTime: 5 * 60_000,
  })

  const rows: any[] = data ?? []

  // Check if any volume series is selected — put on right axis
  const hasVolume = series.some((s) => s.startsWith('total_volume'))
  const hasCount  = series.some((s) => s.endsWith('_count') || s === 'new_users')

  // Summary totals for the period
  const totals = React.useMemo(() => {
    const t: Record<string, number> = {}
    for (const key of series) {
      t[key] = rows.reduce((sum, r) => sum + (r[key] ?? 0), 0)
    }
    return t
  }, [rows, series])

  const configs = SERIES_CONFIGS

  return (
    <div className={cn('bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden', className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-slate-400" />
          <h2 className="text-sm font-semibold text-white">{title}</h2>
        </div>
        {/* Day range tabs */}
        <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-0.5">
          {DAY_OPTIONS.map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={cn(
                'px-2.5 py-1 rounded-md text-xs font-medium transition-colors',
                days === d
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white',
              )}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {/* Summary chips */}
      <div className="flex flex-wrap gap-4 px-5 py-3 border-b border-slate-800/50">
        {series.map((key) => {
          const cfg = configs[key]
          return (
            <div key={key}>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">{cfg.label}</p>
              <p className="text-base font-bold text-white mt-0.5">
                {cfg.format ? cfg.format(totals[key] ?? 0) : (totals[key] ?? 0).toLocaleString()}
              </p>
            </div>
          )
        })}
      </div>

      {/* Chart */}
      <div className="px-2 py-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <Loader2 className="w-6 h-6 animate-spin text-slate-600" />
          </div>
        ) : isError ? (
          <div className="flex justify-center items-center h-48 text-sm text-red-500">
            Failed to load stats.
          </div>
        ) : rows.length === 0 ? (
          <div className="flex justify-center items-center h-48 text-sm text-slate-600">
            No data for this period.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={rows} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <defs>
                {series.map((key) => (
                  <linearGradient key={key} id={`grad-${key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={configs[key].color} stopOpacity={0.25} />
                    <stop offset="100%" stopColor={configs[key].color} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />

              <XAxis
                dataKey="date"
                tick={{ fill: '#64748b', fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatDate}
                interval="preserveStartEnd"
              />

              {/* Left Y axis — counts */}
              {hasCount && (
                <YAxis
                  yAxisId="left"
                  tick={{ fill: '#64748b', fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  width={32}
                  tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : String(v)}
                />
              )}

              {/* Right Y axis — amounts */}
              {hasVolume && volumeOnRight && (
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fill: '#64748b', fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  width={48}
                  tickFormatter={(v) => v >= 1000 ? `$${(v/1000).toFixed(0)}k` : `$${v}`}
                />
              )}

              <Tooltip content={<CustomTooltip configs={configs} />} />

              {series.length > 1 && (
                <Legend
                  formatter={(value) => (
                    <span style={{ color: '#94a3b8', fontSize: 11 }}>
                      {configs[value as SeriesKey]?.label ?? value}
                    </span>
                  )}
                />
              )}

              {series.map((key) => {
                const cfg = configs[key]
                const isVol = key.startsWith('total_volume')
                const yAxisId = hasCount
                  ? (isVol && volumeOnRight ? 'right' : 'left')
                  : (isVol ? 'right' : 'left')

                return (
                  <Area
                    key={key}
                    type="monotone"
                    dataKey={key}
                    yAxisId={yAxisId}
                    name={key}
                    stroke={cfg.color}
                    strokeWidth={2}
                    fill={`url(#grad-${key})`}
                    dot={false}
                    activeDot={{ r: 4, fill: cfg.color }}
                  />
                )
              })}
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}