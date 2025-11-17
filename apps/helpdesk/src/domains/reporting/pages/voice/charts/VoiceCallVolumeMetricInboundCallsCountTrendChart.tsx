import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { VoiceCallSegment } from 'domains/reporting/models/cubes/VoiceCallCube'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import VoiceCallVolumeMetric from 'domains/reporting/pages/voice/components/VoiceCallVolumeMetric/VoiceCallVolumeMetric'
import {
    INBOUND_CALLS_METRIC_HINT,
    INBOUND_CALLS_METRIC_TITLE,
} from 'domains/reporting/pages/voice/constants/voiceOverview'
import { useVoiceCallCountTrend } from 'domains/reporting/pages/voice/hooks/useVoiceCallCountTrend'

export const VoiceCallVolumeMetricInboundCallsCountTrend = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    const { cleanStatsFilters, userTimezone } = useStatsFilters()
    const inboundCallsCountTrend = useVoiceCallCountTrend(
        cleanStatsFilters,
        userTimezone,
        VoiceCallSegment.inboundCalls,
    )

    return (
        <VoiceCallVolumeMetric
            title={INBOUND_CALLS_METRIC_TITLE}
            hint={INBOUND_CALLS_METRIC_HINT}
            statsFilters={cleanStatsFilters}
            metricTrend={inboundCallsCountTrend}
            dashboard={dashboard}
            chartId={chartId}
        />
    )
}
