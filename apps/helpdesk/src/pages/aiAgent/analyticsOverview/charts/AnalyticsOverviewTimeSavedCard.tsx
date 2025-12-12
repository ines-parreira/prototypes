import { TrendCard } from '@repo/reporting'

import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { ChartsActionMenu } from 'domains/reporting/pages/dashboards/ChartsActionMenu/ChartsActionMenu'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'

import { useTimeSavedMetric } from '../hooks/useTimeSavedMetric'
import { formatPreviousPeriod } from '../utils/formatPreviousPeriod'

export const AnalyticsOverviewTimeSavedCard = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    const { cleanStatsFilters } = useStatsFilters()
    const trend = useTimeSavedMetric()

    const trendTooltipData = formatPreviousPeriod(cleanStatsFilters?.period)

    return (
        <TrendCard
            trend={trend}
            metricFormat="duration"
            interpretAs="more-is-better"
            isLoading={trend.isFetching}
            withBorder
            withFixedWidth={false}
            hint={{
                title: 'Time saved per agent',
                caption:
                    'The time agent would have spent resolving customer inquiries without all automation features.',
            }}
            trendBadgeTooltipData={{ period: trendTooltipData }}
            actionMenu={
                chartId ? (
                    <ChartsActionMenu
                        chartId={chartId}
                        dashboard={dashboard}
                        chartName={trend.data?.label}
                    />
                ) : undefined
            }
        />
    )
}
