import { TrendCard } from '@repo/reporting'

import { useAIAgentAutomationRateTrend } from 'domains/reporting/hooks/automate/useAIAgentAutomationRateTrend'
import { useReportingTrendCardProps } from 'domains/reporting/hooks/useReportingTrendCardProps'
import { dynamicAllAgentsAutomationRateTimeseriesQueryFactoryV2 } from 'domains/reporting/models/scopes/overallAutomationRate'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'

export const AnalyticsAiAgentAutomationRateCard = ({
    chartId,
    dashboard,
    chartConfig,
}: DashboardChartProps) => {
    const trendCardProps = useReportingTrendCardProps({
        useTrend: useAIAgentAutomationRateTrend,
        chartConfig: chartConfig!,
        chartId,
        isAiAgentTrendCard: true,
        dashboard,
        timeSeriesView: {
            queryFactory:
                dynamicAllAgentsAutomationRateTimeseriesQueryFactoryV2,
        },
    })

    return <TrendCard {...trendCardProps} />
}
