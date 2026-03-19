import { TrendCard } from '@repo/reporting'

import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { AiAgentDrillDownMetricName } from 'domains/reporting/pages/automate/aiAgent/aiAgentDrillDownMetrics'
import { ChartsActionMenu } from 'domains/reporting/pages/dashboards/ChartsActionMenu/ChartsActionMenu'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import { useAiAgentTrendCardDrillDown } from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentTrendCardDrillDown'
import { formatPreviousPeriod } from 'pages/aiAgent/analyticsOverview/utils/formatPreviousPeriod'

import { useAiAgentAutomatedInteractionsMetric } from '../hooks/useAiAgentAutomatedInteractionsMetric'

export const AnalyticsAiAgentAutomatedInteractionsCard = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    const { cleanStatsFilters } = useStatsFilters()
    const trend = useAiAgentAutomatedInteractionsMetric()

    const trendTooltipData = formatPreviousPeriod(cleanStatsFilters?.period)

    const drillDown = useAiAgentTrendCardDrillDown(
        {
            metricName: AiAgentDrillDownMetricName.AutomatedInteractionsCard,
            title: 'Automated interactions',
        },
        trend.data?.value,
    )

    return (
        <TrendCard
            trend={trend}
            metricFormat="decimal"
            interpretAs="more-is-better"
            isLoading={trend.isFetching}
            withBorder
            withFixedWidth={false}
            hint={{
                title: 'Automated interactions',
                caption:
                    'The number of fully automated interactions solved without any human agent intervention.',
            }}
            trendBadgeTooltipData={{ period: trendTooltipData }}
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
