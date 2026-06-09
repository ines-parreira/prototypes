import { TrendCard } from '@repo/reporting'

import { useReportingTrendCardProps } from 'domains/reporting/hooks/useReportingTrendCardProps'
import { getStatsTrendHook } from 'domains/reporting/hooks/useStatsMetricTrend'
import {
    channelsEmailTicketsRepliedTimeseriesQueryFactoryV2,
    channelsEmailTicketsRepliedValueQueryFactoryV2,
} from 'domains/reporting/models/scopes/ticketsReplied'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'

export const ChannelsEmailTicketsRepliedCard = ({
    chartId,
    dashboard,
    chartConfig,
}: DashboardChartProps) => {
    const trendCardProps = useReportingTrendCardProps({
        useTrend: getStatsTrendHook(
            channelsEmailTicketsRepliedValueQueryFactoryV2,
        ),
        chartConfig: chartConfig!,
        isAiAgentTrendCard: false,
        chartId,
        dashboard,
        timeSeriesView: {
            queryFactory: channelsEmailTicketsRepliedTimeseriesQueryFactoryV2,
        },
    })

    return <TrendCard {...trendCardProps} />
}
