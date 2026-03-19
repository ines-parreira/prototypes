import { TrendCard } from '@repo/reporting'

import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { AiAgentDrillDownMetricName } from 'domains/reporting/pages/automate/aiAgent/aiAgentDrillDownMetrics'
import { ChartsActionMenu } from 'domains/reporting/pages/dashboards/ChartsActionMenu/ChartsActionMenu'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import { useAiAgentSupportInteractionsMetric } from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentSupportInteractionsMetric'
import { useAiAgentTrendCardDrillDown } from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentTrendCardDrillDown'
import { formatPreviousPeriod } from 'pages/aiAgent/analyticsOverview/utils/formatPreviousPeriod'

export const AnalyticsAiAgentSupportInteractionsCard = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    const { cleanStatsFilters } = useStatsFilters()
    const trendTooltipData = formatPreviousPeriod(cleanStatsFilters?.period)

    const trend = useAiAgentSupportInteractionsMetric()

    const drillDown = useAiAgentTrendCardDrillDown(
        {
            metricName: AiAgentDrillDownMetricName.SupportInteractionsCard,
            title: 'Automated interactions',
        },
        trend.data?.value,
    )

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
            drillDown={drillDown}
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
