import { TrendCard } from '@repo/reporting'

import { useReportingTrendCardProps } from 'domains/reporting/hooks/useReportingTrendCardProps'
import { getStatsTrendHook } from 'domains/reporting/hooks/useStatsMetricTrend'
import {
    channelsVoiceCallOutcomeTimeseriesQueryFactoryV2,
    channelsVoiceCallOutcomeValueQueryFactoryV2,
} from 'domains/reporting/models/scopes/voiceCalls'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'

export const ChannelsVoiceMissedCallsCard = ({
    chartId,
    dashboard,
    chartConfig,
}: DashboardChartProps) => {
    const trendCardProps = useReportingTrendCardProps({
        useTrend: getStatsTrendHook(
            channelsVoiceCallOutcomeValueQueryFactoryV2,
            'inboundMissedCallsCount',
        ),
        chartConfig: chartConfig!,
        isAiAgentTrendCard: false,
        chartId,
        dashboard,
        timeSeriesView: {
            queryFactory: channelsVoiceCallOutcomeTimeseriesQueryFactoryV2,
            measureName: 'inboundMissedCallsCount',
        },
    })

    return <TrendCard {...trendCardProps} />
}
