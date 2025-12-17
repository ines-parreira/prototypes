import { TrendCard } from '@repo/reporting'

import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { ChartsActionMenu } from 'domains/reporting/pages/dashboards/ChartsActionMenu/ChartsActionMenu'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import { formatPreviousPeriod } from 'pages/aiAgent/analyticsOverview/utils/formatPreviousPeriod'

import { useDecreaseInFirstResponseTimeMetric } from '../hooks/useDecreaseInFirstResponseTimeMetric'

export const AnalyticsAiAgentDecreaseinFRTCard = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    const { cleanStatsFilters } = useStatsFilters()
    const trendTooltipData = formatPreviousPeriod(cleanStatsFilters?.period)

    const trend = useDecreaseInFirstResponseTimeMetric()

    return (
        <TrendCard
            trend={trend}
            metricFormat="duration"
            interpretAs="more-is-better"
            isLoading={trend.isFetching}
            withBorder
            withFixedWidth={false}
            hint={{
                title: 'Decrease in first response time',
                caption:
                    'The reduction in the average time shoppers wait for the first reply to their message when AI Agent is used, compared with tickets resolved manually by support agents.',
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
