import { TrendCard } from '@repo/reporting'

import { useReportingTrendCardProps } from 'domains/reporting/hooks/useReportingTrendCardProps'
import { getStatsTrendHook } from 'domains/reporting/hooks/useStatsMetricTrend'
import {
    closedTicketsTimeseriesQueryFactoryV2,
    closedTicketsValueQueryFactoryV2,
} from 'domains/reporting/models/scopes/ticketsClosed'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'

export const OverviewClosedTicketsCard = ({
    chartId,
    dashboard,
    chartConfig,
}: DashboardChartProps) => {
    const trendCardProps = useReportingTrendCardProps({
        useTrend: getStatsTrendHook(closedTicketsValueQueryFactoryV2),
        chartConfig: chartConfig!,
        isAiAgentTrendCard: false,
        chartId,
        dashboard,
        timeSeriesView: {
            queryFactory: closedTicketsTimeseriesQueryFactoryV2,
        },
    })

    return <TrendCard {...trendCardProps} />
}
