import { TrendCard } from '@repo/reporting'

import { useReportingTrendCardProps } from 'domains/reporting/hooks/useReportingTrendCardProps'
import { getStatsTrendHook } from 'domains/reporting/hooks/useStatsMetricTrend'
import {
    createdTicketsTimeseriesQueryFactoryV2,
    createdTicketsValueQueryFactoryV2,
} from 'domains/reporting/models/scopes/ticketsCreated'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'

export const OverviewCreatedTicketsCard = ({
    chartId,
    dashboard,
    chartConfig,
}: DashboardChartProps) => {
    const trendCardProps = useReportingTrendCardProps({
        useTrend: getStatsTrendHook(createdTicketsValueQueryFactoryV2),
        chartConfig: chartConfig!,
        isAiAgentTrendCard: false,
        chartId,
        dashboard,
        timeSeriesView: {
            queryFactory: createdTicketsTimeseriesQueryFactoryV2,
        },
    })

    return <TrendCard {...trendCardProps} />
}
