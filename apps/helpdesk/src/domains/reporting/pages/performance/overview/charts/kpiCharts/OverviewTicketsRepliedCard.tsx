import { TrendCard } from '@repo/reporting'

import { useReportingTrendCardProps } from 'domains/reporting/hooks/useReportingTrendCardProps'
import { getStatsTrendHook } from 'domains/reporting/hooks/useStatsMetricTrend'
import {
    ticketsRepliedTimeseriesQueryFactoryV2,
    ticketsRepliedValueQueryFactoryV2,
} from 'domains/reporting/models/scopes/ticketsReplied'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'

export const OverviewTicketsRepliedCard = ({
    chartId,
    dashboard,
    chartConfig,
}: DashboardChartProps) => {
    const trendCardProps = useReportingTrendCardProps({
        useTrend: getStatsTrendHook(ticketsRepliedValueQueryFactoryV2),
        chartConfig: chartConfig!,
        isAiAgentTrendCard: false,
        chartId,
        dashboard,
        timeSeriesView: {
            queryFactory: ticketsRepliedTimeseriesQueryFactoryV2,
        },
    })

    return <TrendCard {...trendCardProps} />
}
