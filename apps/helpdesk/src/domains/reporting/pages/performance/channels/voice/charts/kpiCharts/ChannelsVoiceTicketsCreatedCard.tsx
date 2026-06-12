import { TrendCard } from '@repo/reporting'

import { useReportingTrendCardProps } from 'domains/reporting/hooks/useReportingTrendCardProps'
import { getStatsTrendHook } from 'domains/reporting/hooks/useStatsMetricTrend'
import {
    channelsVoiceTicketsCreatedTimeseriesQueryFactoryV2,
    channelsVoiceTicketsCreatedValueQueryFactoryV2,
} from 'domains/reporting/models/scopes/ticketsCreated'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'

export const ChannelsVoiceTicketsCreatedCard = ({
    chartId,
    dashboard,
    chartConfig,
}: DashboardChartProps) => {
    const trendCardProps = useReportingTrendCardProps({
        useTrend: getStatsTrendHook(
            channelsVoiceTicketsCreatedValueQueryFactoryV2,
        ),
        chartConfig: chartConfig!,
        isAiAgentTrendCard: false,
        chartId,
        dashboard,
        timeSeriesView: {
            queryFactory: channelsVoiceTicketsCreatedTimeseriesQueryFactoryV2,
        },
    })

    return <TrendCard {...trendCardProps} />
}
