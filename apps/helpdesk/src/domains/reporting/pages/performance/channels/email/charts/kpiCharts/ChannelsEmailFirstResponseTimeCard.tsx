import { TrendCard } from '@repo/reporting'

import { useReportingTrendCardProps } from 'domains/reporting/hooks/useReportingTrendCardProps'
import { getStatsTrendHook } from 'domains/reporting/hooks/useStatsMetricTrend'
import {
    channelsEmailFirstResponseTimeTimeseriesQueryFactoryV2,
    channelsEmailFirstResponseTimeValueQueryFactoryV2,
} from 'domains/reporting/models/scopes/firstResponseTime'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'

export const ChannelsEmailFirstResponseTimeCard = ({
    chartId,
    dashboard,
    chartConfig,
}: DashboardChartProps) => {
    const trendCardProps = useReportingTrendCardProps({
        useTrend: getStatsTrendHook(
            channelsEmailFirstResponseTimeValueQueryFactoryV2,
        ),
        chartConfig: chartConfig!,
        isAiAgentTrendCard: false,
        chartId,
        dashboard,
        timeSeriesView: {
            queryFactory:
                channelsEmailFirstResponseTimeTimeseriesQueryFactoryV2,
        },
    })

    return <TrendCard {...trendCardProps} />
}
