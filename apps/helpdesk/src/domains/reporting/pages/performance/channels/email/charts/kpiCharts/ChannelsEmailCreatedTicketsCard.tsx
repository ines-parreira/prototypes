import { TrendCard } from '@repo/reporting'

import { useReportingTrendCardProps } from 'domains/reporting/hooks/useReportingTrendCardProps'
import { getStatsTrendHook } from 'domains/reporting/hooks/useStatsMetricTrend'
import {
    channelsEmailCreatedTicketsTimeseriesQueryFactoryV2,
    channelsEmailCreatedTicketsValueQueryFactoryV2,
} from 'domains/reporting/models/scopes/ticketsCreated'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'

export const ChannelsEmailCreatedTicketsCard = ({
    chartId,
    dashboard,
    chartConfig,
}: DashboardChartProps) => {
    const trendCardProps = useReportingTrendCardProps({
        useTrend: getStatsTrendHook(
            channelsEmailCreatedTicketsValueQueryFactoryV2,
        ),
        chartConfig: chartConfig!,
        isAiAgentTrendCard: false,
        chartId,
        dashboard,
        timeSeriesView: {
            queryFactory: channelsEmailCreatedTicketsTimeseriesQueryFactoryV2,
        },
    })

    return <TrendCard {...trendCardProps} />
}
