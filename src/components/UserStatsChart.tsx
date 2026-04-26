/**
 * components/UserStatsChart.tsx  (user-side frontend)
 *
 * Same StatsChart component, wired to /stats/my instead of /admin/stats/daily.
 * Drop this anywhere on the user dashboard or transaction history page.
 *
 * Usage:
 *   import { UserStatsChart } from '@/components/UserStatsChart'
 *
 *   <UserStatsChart />
 */

// import { StatsChart } from './StatsChart'

export function UserStatsChart() {
  return (
    <div className="space-y-4">
      <StatsChart
        title="Your Transfer Volume"
        fetchUrl="/stats/my"
        series={['total_volume_usd', 'total_volume_ghs']}
        defaultDays={30}
      />
      <StatsChart
        title="Your Transfer Activity"
        fetchUrl="/stats/my"
        series={['transaction_count', 'completed_count', 'failed_count']}
        defaultDays={30}
      />
    </div>
  )
}