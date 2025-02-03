import useMetricTrend, {fetchMetricTrend} from 'hooks/reporting/useMetricTrend'
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

export const fetchVoiceCallAverageTimeWaitTimeTrend = (
    filters: StatsFilters,
    timezone: string
) => {
    return fetchMetricTrend(
        voiceCallAverageWaitTimeQueryFactory(filters, timezone),
        voiceCallAverageWaitTimeQueryFactory(
            {...filters, period: getPreviousPeriod(filters.period)},
            timezone
        )
    )
}

export const fetchVoiceCallAverageTimeTalkTimeTrend = (
    filters: StatsFilters,
    timezone: string
) => {
    return fetchMetricTrend(
        voiceCallAverageTalkTimeQueryFactory(filters, timezone),
        voiceCallAverageTalkTimeQueryFactory(
            {...filters, period: getPreviousPeriod(filters.period)},
            timezone
        )
    )
}
