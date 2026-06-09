import { TrendCard } from '@repo/reporting'

import { useReportingTrendCardProps } from 'domains/reporting/hooks/useReportingTrendCardProps'
import { getStatsTrendHook } from 'domains/reporting/hooks/useStatsMetricTrend'
import {
    channelsEmailHumanResponseTimeAfterAiHandoffTimeseriesQueryFactoryV2,
    channelsEmailHumanResponseTimeAfterAiHandoffValueQueryFactoryV2,
} from 'domains/reporting/models/scopes/humanResponseTimeAfterAiHandoff'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'

export const ChannelsEmailHumanResponseTimeAfterAiHandoffCard = ({
    chartId,
    dashboard,
    chartConfig,
}: DashboardChartProps) => {
    const trendCardProps = useReportingTrendCardProps({
        useTrend: getStatsTrendHook(
            channelsEmailHumanResponseTimeAfterAiHandoffValueQueryFactoryV2,
        ),
        chartConfig: chartConfig!,
        isAiAgentTrendCard: false,
        chartId,
        dashboard,
        timeSeriesView: {
            queryFactory:
                channelsEmailHumanResponseTimeAfterAiHandoffTimeseriesQueryFactoryV2,
        },
    })

    return <TrendCard {...trendCardProps} />
}
