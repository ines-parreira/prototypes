import {StatsFilters} from 'models/stat/types'
import useMetricTrend from 'hooks/reporting/useMetricTrend'
import {
    voiceCallAverageTalkTimeQueryFactory,
    voiceCallAverageWaitTimeQueryFactory,
} from 'models/reporting/queryFactories/voice/voiceCall'
import {getPreviousPeriod} from 'utils/reporting'
import {VoiceCallAverageTimeMetric} from 'pages/stats/voice/models/types'

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
