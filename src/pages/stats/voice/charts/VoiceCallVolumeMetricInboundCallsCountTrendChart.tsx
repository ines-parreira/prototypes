import React from 'react'

import {VoiceCallSegment} from 'models/reporting/cubes/VoiceCallCube'
import {DashboardChartProps} from 'pages/stats/custom-reports/types'
import VoiceCallVolumeMetric from 'pages/stats/voice/components/VoiceCallVolumeMetric/VoiceCallVolumeMetric'
import {
    INBOUND_CALLS_METRIC_HINT,
    INBOUND_CALLS_METRIC_TITLE,
} from 'pages/stats/voice/constants/voiceOverview'
import {useNewVoiceStatsFilters} from 'pages/stats/voice/hooks/useNewVoiceStatsFilters'
import {useVoiceCallCountTrend} from 'pages/stats/voice/hooks/useVoiceCallCountTrend'

export const VoiceCallVolumeMetricInboundCallsCountTrend = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    const {cleanStatsFilters, userTimezone} = useNewVoiceStatsFilters()
    const inboundCallsCountTrend = useVoiceCallCountTrend(
        cleanStatsFilters,
        userTimezone,
        VoiceCallSegment.inboundCalls
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
