import React from 'react'

import { DashboardChartProps } from 'pages/stats/dashboards/types'
import VoiceCallCallerExperienceMetric from 'pages/stats/voice/components/VoiceCallerExperienceMetric/VoiceCallCallerExperienceMetric'
import {
    AVERAGE_TALK_TIME_METRIC_HINT,
    AVERAGE_TALK_TIME_METRIC_TITLE,
} from 'pages/stats/voice/constants/voiceOverview'
import { useNewVoiceStatsFilters } from 'pages/stats/voice/hooks/useNewVoiceStatsFilters'
import { useVoiceCallAverageTimeTrend } from 'pages/stats/voice/hooks/useVoiceCallAverageTimeTrend'
import { VoiceCallAverageTimeMetric } from 'pages/stats/voice/models/types'
import { VoiceMetric } from 'state/ui/stats/types'

export const VoiceCallCallerExperienceAverageTalkTime = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    const { cleanStatsFilters, userTimezone, isAnalyticsNewFilters } =
        useNewVoiceStatsFilters()
    const averageTalkTimeTrend = useVoiceCallAverageTimeTrend(
        VoiceCallAverageTimeMetric.TalkTime,
        cleanStatsFilters,
        userTimezone,
    )
    return (
        <VoiceCallCallerExperienceMetric
            chartId={chartId}
            dashboard={dashboard}
            isAnalyticsNewFilters={isAnalyticsNewFilters}
            title={AVERAGE_TALK_TIME_METRIC_TITLE}
            hint={AVERAGE_TALK_TIME_METRIC_HINT}
            statsFilters={cleanStatsFilters}
            metricTrend={averageTalkTimeTrend}
            metricData={{
                metricName: VoiceMetric.AverageTalkTime,
                title: AVERAGE_TALK_TIME_METRIC_TITLE,
            }}
        />
    )
}
