import { TrendCard } from '@repo/reporting'

import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { ChartsActionMenu } from 'domains/reporting/pages/dashboards/ChartsActionMenu/ChartsActionMenu'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import { useAiAgentTimeSavedMetric } from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentTimeSavedMetric'
import { formatPreviousPeriod } from 'pages/aiAgent/analyticsOverview/utils/formatPreviousPeriod'

export const AnalyticsAiAgentTimeSavedCard = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    const { cleanStatsFilters } = useStatsFilters()
    const trendTooltipData = formatPreviousPeriod(cleanStatsFilters?.period)

    const trend = useAiAgentTimeSavedMetric()

    return (
        <TrendCard
            trend={trend}
            metricFormat="duration"
            interpretAs="more-is-better"
            withBorder
            withFixedWidth={false}
            isLoading={trend.isFetching}
            trendBadgeTooltipData={{ period: trendTooltipData }}
            hint={{
                title: 'Time saved by agents',
                caption:
                    'The time agent would have spent resolving customer inquiries without AI Agent.',
            }}
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
