import useMetricTrend, {
    fetchMetricTrend,
} from 'domains/reporting/hooks/useMetricTrend'
import {
    voiceCallAverageTalkTimeQueryFactory,
    voiceCallAverageWaitTimeQueryFactory,
} from 'domains/reporting/models/queryFactories/voice/voiceCall'
import {
    voiceCallsAverageTalkTimeQueryFactoryV2,
    voiceCallsAverageWaitTimeQueryFactoryV2,
} from 'domains/reporting/models/scopes/voiceCalls'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { VoiceCallAverageTimeMetric } from 'domains/reporting/pages/voice/models/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'

export const useVoiceCallAverageTimeTrend = (
    metric: VoiceCallAverageTimeMetric,
    filters: StatsFilters,
    timezone: string,
) => {
    const factory =
        metric === VoiceCallAverageTimeMetric.TalkTime
            ? voiceCallAverageTalkTimeQueryFactory
            : voiceCallAverageWaitTimeQueryFactory

    const factoryV2 =
        metric === VoiceCallAverageTimeMetric.TalkTime
            ? voiceCallsAverageTalkTimeQueryFactoryV2
            : voiceCallsAverageWaitTimeQueryFactoryV2
    return useMetricTrend(
        factory(filters, timezone),
        factory(
            { ...filters, period: getPreviousPeriod(filters.period) },
            timezone,
        ),
        factoryV2({
            filters,
            timezone,
        }),
        factoryV2({
            filters: {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        }),
    )
}

export const fetchVoiceCallAverageTimeWaitTimeTrend = (
    filters: StatsFilters,
    timezone: string,
) => {
    return fetchMetricTrend(
        voiceCallAverageWaitTimeQueryFactory(filters, timezone),
        voiceCallAverageWaitTimeQueryFactory(
            { ...filters, period: getPreviousPeriod(filters.period) },
            timezone,
        ),
        voiceCallsAverageWaitTimeQueryFactoryV2({
            filters,
            timezone,
        }),
        voiceCallsAverageWaitTimeQueryFactoryV2({
            filters: {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        }),
    )
}

export const fetchVoiceCallAverageTimeTalkTimeTrend = (
    filters: StatsFilters,
    timezone: string,
) => {
    return fetchMetricTrend(
        voiceCallAverageTalkTimeQueryFactory(filters, timezone),
        voiceCallAverageTalkTimeQueryFactory(
            { ...filters, period: getPreviousPeriod(filters.period) },
            timezone,
        ),
        voiceCallsAverageTalkTimeQueryFactoryV2({
            filters,
            timezone,
        }),
        voiceCallsAverageTalkTimeQueryFactoryV2({
            filters: {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        }),
    )
}
