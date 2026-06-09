import { TrendCard } from '@repo/reporting'

import { useReportingTrendCardProps } from 'domains/reporting/hooks/useReportingTrendCardProps'
import { getStatsTrendHook } from 'domains/reporting/hooks/useStatsMetricTrend'
import {
    channelsEmailMessagesSentTimeseriesQueryFactoryV2,
    channelsEmailMessagesSentValueQueryFactoryV2,
} from 'domains/reporting/models/scopes/messagesSent'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'

export const ChannelsEmailMessagesSentCard = ({
    chartId,
    dashboard,
    chartConfig,
}: DashboardChartProps) => {
    const trendCardProps = useReportingTrendCardProps({
        useTrend: getStatsTrendHook(
            channelsEmailMessagesSentValueQueryFactoryV2,
        ),
        chartConfig: chartConfig!,
        isAiAgentTrendCard: false,
        chartId,
        dashboard,
        timeSeriesView: {
            queryFactory: channelsEmailMessagesSentTimeseriesQueryFactoryV2,
        },
    })

    return <TrendCard {...trendCardProps} />
}
