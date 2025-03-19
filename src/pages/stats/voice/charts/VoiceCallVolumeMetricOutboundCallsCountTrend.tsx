import { useStatsFilters } from 'hooks/reporting/support-performance/useStatsFilters'
import { VoiceCallSegment } from 'models/reporting/cubes/VoiceCallCube'
import { DashboardChartProps } from 'pages/stats/dashboards/types'
import VoiceCallVolumeMetric from 'pages/stats/voice/components/VoiceCallVolumeMetric/VoiceCallVolumeMetric'
import {
    OUTBOUND_CALLS_METRIC_HINT,
    OUTBOUND_CALLS_METRIC_TITLE,
} from 'pages/stats/voice/constants/voiceOverview'
import { useVoiceCallCountTrend } from 'pages/stats/voice/hooks/useVoiceCallCountTrend'

export const VoiceCallVolumeMetricOutboundCallsCountTrend = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    const { cleanStatsFilters, userTimezone } = useStatsFilters()
    const outboundCallsCountTrend = useVoiceCallCountTrend(
        cleanStatsFilters,
        userTimezone,
        VoiceCallSegment.outboundCalls,
    )

    return (
        <VoiceCallVolumeMetric
            title={OUTBOUND_CALLS_METRIC_TITLE}
            hint={OUTBOUND_CALLS_METRIC_HINT}
            statsFilters={cleanStatsFilters}
            metricTrend={outboundCallsCountTrend}
            dashboard={dashboard}
            chartId={chartId}
        />
    )
}
