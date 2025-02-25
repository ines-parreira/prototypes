import React from 'react'

import { VoiceCallSegment } from 'models/reporting/cubes/VoiceCallCube'
import { DashboardChartProps } from 'pages/stats/custom-reports/types'
import VoiceCallVolumeMetric from 'pages/stats/voice/components/VoiceCallVolumeMetric/VoiceCallVolumeMetric'
import {
    DEPRECATED_MISSED_CALLS_METRIC_HINT,
    DEPRECATED_MISSED_CALLS_METRIC_TITLE,
} from 'pages/stats/voice/constants/voiceOverview'
import { useNewVoiceStatsFilters } from 'pages/stats/voice/hooks/useNewVoiceStatsFilters'
import { useVoiceCallCountTrend } from 'pages/stats/voice/hooks/useVoiceCallCountTrend'

export const VoiceCallVolumeMetricMissedCallsCountTrendChart = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    const { cleanStatsFilters, userTimezone } = useNewVoiceStatsFilters()
    const missedCallsCountTrend = useVoiceCallCountTrend(
        cleanStatsFilters,
        userTimezone,
        VoiceCallSegment.missedCalls,
    )

    return (
        <VoiceCallVolumeMetric
            title={DEPRECATED_MISSED_CALLS_METRIC_TITLE}
            hint={DEPRECATED_MISSED_CALLS_METRIC_HINT}
            statsFilters={cleanStatsFilters}
            metricTrend={missedCallsCountTrend}
            chartId={chartId}
            dashboard={dashboard}
            moreIsBetter={false}
        />
    )
}
