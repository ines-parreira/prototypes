import React from 'react'

import { useStatsFilters } from 'hooks/reporting/support-performance/useStatsFilters'
import { VoiceCallSegment } from 'models/reporting/cubes/VoiceCallCube'
import { DashboardChartProps } from 'pages/stats/dashboards/types'
import VoiceCallVolumeMetric from 'pages/stats/voice/components/VoiceCallVolumeMetric/VoiceCallVolumeMetric'
import {
    INBOUND_CALLS_METRIC_HINT,
    INBOUND_CALLS_METRIC_TITLE,
} from 'pages/stats/voice/constants/voiceOverview'
import { useVoiceCallCountTrend } from 'pages/stats/voice/hooks/useVoiceCallCountTrend'

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
