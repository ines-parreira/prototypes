import { TrendCard } from '@repo/reporting'

import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { ChartsActionMenu } from 'domains/reporting/pages/dashboards/ChartsActionMenu/ChartsActionMenu'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import { useAiAgentSupportInteractionsMetric } from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentSupportInteractionsMetric'
import { formatPreviousPeriod } from 'pages/aiAgent/analyticsOverview/utils/formatPreviousPeriod'

export const AnalyticsAiAgentSupportInteractionsCard = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    const { cleanStatsFilters } = useStatsFilters()
    const trendTooltipData = formatPreviousPeriod(cleanStatsFilters?.period)

    const trend = useAiAgentSupportInteractionsMetric()

    return (
        <TrendCard
            trend={trend}
            metricFormat="decimal"
            interpretAs="more-is-better"
            withBorder
            withFixedWidth={false}
            isLoading={trend.isFetching}
            trendBadgeTooltipData={{ period: trendTooltipData }}
            hint={{
                title: 'Support tickets',
                caption:
                    'The number of fully automated interactions by AI Agent Support skills without human agent intervention.',
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
