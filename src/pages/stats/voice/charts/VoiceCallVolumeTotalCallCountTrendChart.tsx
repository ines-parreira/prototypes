import React from 'react'

import {DashboardChartProps} from 'pages/stats/custom-reports/types'
import VoiceCallVolumeMetric from 'pages/stats/voice/components/VoiceCallVolumeMetric/VoiceCallVolumeMetric'
import {
    TOTAL_CALLS_METRIC_HINT,
    TOTAL_CALLS_METRIC_TITLE,
} from 'pages/stats/voice/constants/voiceOverview'
import {useNewVoiceStatsFilters} from 'pages/stats/voice/hooks/useNewVoiceStatsFilters'
import {useVoiceCallCountTrend} from 'pages/stats/voice/hooks/useVoiceCallCountTrend'

export const VoiceCallVolumeTotalCallCountTrendChart = ({
    chartId,
}: DashboardChartProps) => {
    const {cleanStatsFilters, userTimezone} = useNewVoiceStatsFilters()
    const totalCallsCountTrend = useVoiceCallCountTrend(
        cleanStatsFilters,
        userTimezone
    )

    return (
        <VoiceCallVolumeMetric
            title={TOTAL_CALLS_METRIC_TITLE}
            hint={TOTAL_CALLS_METRIC_HINT}
            statsFilters={cleanStatsFilters}
            metricTrend={totalCallsCountTrend}
            chartId={chartId}
        />
    )
}
