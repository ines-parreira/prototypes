import { TrendCard } from '@repo/reporting'

import { useReportingTrendCardProps } from 'domains/reporting/hooks/useReportingTrendCardProps'
import { getStatsTrendHook } from 'domains/reporting/hooks/useStatsMetricTrend'
import {
    sentMessagesTimeseriesQueryFactoryV2,
    sentMessagesValueQueryFactoryV2,
} from 'domains/reporting/models/scopes/messagesSent'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'

export const OverviewMessagesSentCard = ({
    chartId,
    dashboard,
    chartConfig,
}: DashboardChartProps) => {
    const trendCardProps = useReportingTrendCardProps({
        useTrend: getStatsTrendHook(sentMessagesValueQueryFactoryV2),
        chartConfig: chartConfig!,
        isAiAgentTrendCard: false,
        chartId,
        dashboard,
        timeSeriesView: {
            queryFactory: sentMessagesTimeseriesQueryFactoryV2,
        },
    })

    return <TrendCard {...trendCardProps} />
}
