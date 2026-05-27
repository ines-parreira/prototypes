import { TrendCard } from '@repo/reporting'

import { useReportingTrendCardProps } from 'domains/reporting/hooks/useReportingTrendCardProps'
import { getStatsTrendHook } from 'domains/reporting/hooks/useStatsMetricTrend'
import { averageScoreQueryV2Factory } from 'domains/reporting/models/scopes/satisfactionSurveys'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'

export const ChannelsEmailAverageCSATCard = ({
    chartId,
    dashboard,
    chartConfig,
}: DashboardChartProps) => {
    const trendCardProps = useReportingTrendCardProps({
        useTrend: getStatsTrendHook(averageScoreQueryV2Factory),
        chartConfig: chartConfig!,
        isAiAgentTrendCard: false,
        chartId,
        dashboard,
    })

    return <TrendCard {...trendCardProps} />
}
