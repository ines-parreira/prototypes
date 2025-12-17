import { TrendCard } from '@repo/reporting'

import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { ChartsActionMenu } from 'domains/reporting/pages/dashboards/ChartsActionMenu/ChartsActionMenu'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import { useOrdersInfluencedMetric } from 'pages/aiAgent/analyticsAiAgent/hooks/useOrdersInfluencedMetric'
import { formatPreviousPeriod } from 'pages/aiAgent/analyticsOverview/utils/formatPreviousPeriod'

export const AnalyticsAiAgentOrdersInfluencedCard = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    const { cleanStatsFilters } = useStatsFilters()
    const trendTooltipData = formatPreviousPeriod(cleanStatsFilters?.period)

    const trend = useOrdersInfluencedMetric()

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
                title: 'Orders influenced',
                caption:
                    'The number of orders placed within 3 days of a Shopping Assistant conversation without a direct handover.',
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
