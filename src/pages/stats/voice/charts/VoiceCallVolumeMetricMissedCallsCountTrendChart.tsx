import React from 'react'

import {VoiceCallSegment} from 'models/reporting/cubes/VoiceCallCube'
import VoiceCallVolumeMetric from 'pages/stats/voice/components/VoiceCallVolumeMetric/VoiceCallVolumeMetric'
import {
    MISSED_CALLS_METRIC_HINT,
    MISSED_CALLS_METRIC_TITLE,
} from 'pages/stats/voice/constants/voiceOverview'
import {useNewVoiceStatsFilters} from 'pages/stats/voice/hooks/useNewVoiceStatsFilters'
import {useVoiceCallCountTrend} from 'pages/stats/voice/hooks/useVoiceCallCountTrend'

export const VoiceCallVolumeMetricMissedCallsCountTrendChart = () => {
    const {cleanStatsFilters, userTimezone} = useNewVoiceStatsFilters()
    const missedCallsCountTrend = useVoiceCallCountTrend(
        cleanStatsFilters,
        userTimezone,
        VoiceCallSegment.missedCalls
    )

    return (
        <VoiceCallVolumeMetric
            title={MISSED_CALLS_METRIC_TITLE}
            hint={MISSED_CALLS_METRIC_HINT}
            statsFilters={cleanStatsFilters}
            metricTrend={missedCallsCountTrend}
            moreIsBetter={false}
        />
    )
}
