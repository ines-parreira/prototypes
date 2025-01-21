import React from 'react'

import {VoiceCallSegment} from 'models/reporting/cubes/VoiceCallCube'
import {DashboardChartProps} from 'pages/stats/custom-reports/types'
import VoiceCallVolumeMetric from 'pages/stats/voice/components/VoiceCallVolumeMetric/VoiceCallVolumeMetric'
import {
    OUTBOUND_CALLS_METRIC_HINT,
    OUTBOUND_CALLS_METRIC_TITLE,
} from 'pages/stats/voice/constants/voiceOverview'
import {useNewVoiceStatsFilters} from 'pages/stats/voice/hooks/useNewVoiceStatsFilters'
import {useVoiceCallCountTrend} from 'pages/stats/voice/hooks/useVoiceCallCountTrend'

export const VoiceCallVolumeMetricOutboundCallsCountTrend = ({
    chartId,
}: DashboardChartProps) => {
    const {cleanStatsFilters, userTimezone} = useNewVoiceStatsFilters()
    const outboundCallsCountTrend = useVoiceCallCountTrend(
        cleanStatsFilters,
        userTimezone,
        VoiceCallSegment.outboundCalls
    )

    return (
        <VoiceCallVolumeMetric
            title={OUTBOUND_CALLS_METRIC_TITLE}
            hint={OUTBOUND_CALLS_METRIC_HINT}
            statsFilters={cleanStatsFilters}
            metricTrend={outboundCallsCountTrend}
            chartId={chartId}
        />
    )
}
