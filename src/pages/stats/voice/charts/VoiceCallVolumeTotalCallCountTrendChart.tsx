import React from 'react'

import { useStatsFilters } from 'hooks/reporting/support-performance/useStatsFilters'
import { DashboardChartProps } from 'pages/stats/dashboards/types'
import VoiceCallVolumeMetric from 'pages/stats/voice/components/VoiceCallVolumeMetric/VoiceCallVolumeMetric'
import {
    TOTAL_CALLS_METRIC_HINT,
    TOTAL_CALLS_METRIC_TITLE,
} from 'pages/stats/voice/constants/voiceOverview'
import { useVoiceCallCountTrend } from 'pages/stats/voice/hooks/useVoiceCallCountTrend'

export const VoiceCallVolumeTotalCallCountTrendChart = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    const { cleanStatsFilters, userTimezone } = useStatsFilters()
    const totalCallsCountTrend = useVoiceCallCountTrend(
        cleanStatsFilters,
        userTimezone,
    )

    return (
        <VoiceCallVolumeMetric
            title={TOTAL_CALLS_METRIC_TITLE}
            hint={TOTAL_CALLS_METRIC_HINT}
            statsFilters={cleanStatsFilters}
            metricTrend={totalCallsCountTrend}
            dashboard={dashboard}
            chartId={chartId}
        />
    )
}
