import { TrendCard } from '@repo/reporting'

import { useReportingTrendCardProps } from 'domains/reporting/hooks/useReportingTrendCardProps'
import { getStatsTrendHook } from 'domains/reporting/hooks/useStatsMetricTrend'
import {
    channelsVoiceAverageWaitTimeTimeseriesQueryFactoryV2,
    channelsVoiceAverageWaitTimeValueQueryFactoryV2,
} from 'domains/reporting/models/scopes/voiceCalls'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'

export const ChannelsVoiceAverageWaitTimeCard = ({
    chartId,
    dashboard,
    chartConfig,
}: DashboardChartProps) => {
    const trendCardProps = useReportingTrendCardProps({
        useTrend: getStatsTrendHook(
            channelsVoiceAverageWaitTimeValueQueryFactoryV2,
        ),
        chartConfig: chartConfig!,
        isAiAgentTrendCard: false,
        chartId,
        dashboard,
        timeSeriesView: {
            queryFactory: channelsVoiceAverageWaitTimeTimeseriesQueryFactoryV2,
        },
    })

    return <TrendCard {...trendCardProps} />
}
