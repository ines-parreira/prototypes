import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { VoiceCallSegment } from 'domains/reporting/models/cubes/VoiceCallCube'
import { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import VoiceCallVolumeMetric from 'domains/reporting/pages/voice/components/VoiceCallVolumeMetric/VoiceCallVolumeMetric'
import {
    OUTBOUND_CALLS_METRIC_HINT,
    OUTBOUND_CALLS_METRIC_TITLE,
} from 'domains/reporting/pages/voice/constants/voiceOverview'
import { useVoiceCallCountTrend } from 'domains/reporting/pages/voice/hooks/useVoiceCallCountTrend'

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
