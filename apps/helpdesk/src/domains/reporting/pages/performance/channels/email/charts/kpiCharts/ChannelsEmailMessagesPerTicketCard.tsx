import { TrendCard } from '@repo/reporting'

import { useReportingTrendCardProps } from 'domains/reporting/hooks/useReportingTrendCardProps'
import { getStatsTrendHook } from 'domains/reporting/hooks/useStatsMetricTrend'
import {
    channelsEmailMessagesPerTicketTimeseriesQueryFactoryV2,
    channelsEmailMessagesPerTicketValueQueryFactoryV2,
} from 'domains/reporting/models/scopes/messagesPerTicket'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'

export const ChannelsEmailMessagesPerTicketCard = ({
    chartId,
    dashboard,
    chartConfig,
}: DashboardChartProps) => {
    const trendCardProps = useReportingTrendCardProps({
        useTrend: getStatsTrendHook(
            channelsEmailMessagesPerTicketValueQueryFactoryV2,
        ),
        chartConfig: chartConfig!,
        isAiAgentTrendCard: false,
        chartId,
        dashboard,
        timeSeriesView: {
            queryFactory:
                channelsEmailMessagesPerTicketTimeseriesQueryFactoryV2,
        },
    })

    return <TrendCard {...trendCardProps} />
}
