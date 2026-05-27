import { TrendCard } from '@repo/reporting'

import { useReportingTrendCardProps } from 'domains/reporting/hooks/useReportingTrendCardProps'
import { getStatsTrendHook } from 'domains/reporting/hooks/useStatsMetricTrend'
import {
    messagesPerTicketTimeseriesQueryFactoryV2,
    messagesPerTicketValueQueryFactoryV2,
} from 'domains/reporting/models/scopes/messagesPerTicket'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'

export const OverviewMessagesPerTicketCard = ({
    chartId,
    dashboard,
    chartConfig,
}: DashboardChartProps) => {
    const trendCardProps = useReportingTrendCardProps({
        useTrend: getStatsTrendHook(messagesPerTicketValueQueryFactoryV2),
        chartConfig: chartConfig!,
        isAiAgentTrendCard: false,
        chartId,
        dashboard,
        timeSeriesView: {
            queryFactory: messagesPerTicketTimeseriesQueryFactoryV2,
        },
    })

    return <TrendCard {...trendCardProps} />
}
