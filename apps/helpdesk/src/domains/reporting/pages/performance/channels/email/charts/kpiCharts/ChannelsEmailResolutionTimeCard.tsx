import { TrendCard } from '@repo/reporting'

import { useReportingTrendCardProps } from 'domains/reporting/hooks/useReportingTrendCardProps'
import { getStatsTrendHook } from 'domains/reporting/hooks/useStatsMetricTrend'
import {
    channelsEmailResolutionTimeTimeseriesQueryFactoryV2,
    channelsEmailResolutionTimeValueQueryFactoryV2,
} from 'domains/reporting/models/scopes/resolutionTime'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'

export const ChannelsEmailResolutionTimeCard = ({
    chartId,
    dashboard,
    chartConfig,
}: DashboardChartProps) => {
    const trendCardProps = useReportingTrendCardProps({
        useTrend: getStatsTrendHook(
            channelsEmailResolutionTimeValueQueryFactoryV2,
        ),
        chartConfig: chartConfig!,
        isAiAgentTrendCard: false,
        chartId,
        dashboard,
        timeSeriesView: {
            queryFactory: channelsEmailResolutionTimeTimeseriesQueryFactoryV2,
        },
    })

    return <TrendCard {...trendCardProps} />
}
