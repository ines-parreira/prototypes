import useMetricTrend from 'hooks/reporting/useMetricTrend'
import {
    voiceCallAverageTalkTimeQueryFactory,
    voiceCallAverageWaitTimeQueryFactory,
} from 'models/reporting/queryFactories/voice/voiceCall'
import {StatsFilters} from 'models/stat/types'
import {VoiceCallAverageTimeMetric} from 'pages/stats/voice/models/types'
import {getPreviousPeriod} from 'utils/reporting'

export const useVoiceCallAverageTimeTrend = (
    metric: VoiceCallAverageTimeMetric,
    filters: StatsFilters,
    timezone: string
) => {
    const factory =
        metric === VoiceCallAverageTimeMetric.TalkTime
            ? voiceCallAverageTalkTimeQueryFactory
            : voiceCallAverageWaitTimeQueryFactory
    return useMetricTrend(
        factory(filters, timezone),
        factory(
            {...filters, period: getPreviousPeriod(filters.period)},
            timezone
        )
    )
}
