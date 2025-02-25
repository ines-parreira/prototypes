import React from 'react'

import { DashboardChartProps } from 'pages/stats/custom-reports/types'
import VoiceCallCallerExperienceMetric from 'pages/stats/voice/components/VoiceCallerExperienceMetric/VoiceCallCallerExperienceMetric'
import {
    AVERAGE_WAIT_TIME_METRIC_HINT,
    AVERAGE_WAIT_TIME_METRIC_TITLE,
} from 'pages/stats/voice/constants/voiceOverview'
import { useNewVoiceStatsFilters } from 'pages/stats/voice/hooks/useNewVoiceStatsFilters'
import { useVoiceCallAverageTimeTrend } from 'pages/stats/voice/hooks/useVoiceCallAverageTimeTrend'
import { VoiceCallAverageTimeMetric } from 'pages/stats/voice/models/types'
import { VoiceMetric } from 'state/ui/stats/types'

export const VoiceCallCallerExperienceAverageWaitTimeChart = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    const { cleanStatsFilters, userTimezone, isAnalyticsNewFilters } =
        useNewVoiceStatsFilters()
    const averageWaitTimeTrend = useVoiceCallAverageTimeTrend(
        VoiceCallAverageTimeMetric.WaitTime,
        cleanStatsFilters,
        userTimezone,
    )

    return (
        <VoiceCallCallerExperienceMetric
            chartId={chartId}
            dashboard={dashboard}
            isAnalyticsNewFilters={isAnalyticsNewFilters}
            title={AVERAGE_WAIT_TIME_METRIC_TITLE}
            hint={AVERAGE_WAIT_TIME_METRIC_HINT}
            statsFilters={cleanStatsFilters}
            metricTrend={averageWaitTimeTrend}
            metricData={{
                metricName: VoiceMetric.AverageWaitTime,
                title: AVERAGE_WAIT_TIME_METRIC_TITLE,
            }}
        />
    )
}
