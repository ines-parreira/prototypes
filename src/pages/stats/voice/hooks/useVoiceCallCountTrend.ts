import useMetricTrend, {fetchMetricTrend} from 'hooks/reporting/useMetricTrend'
import {VoiceCallSegment} from 'models/reporting/cubes/VoiceCallCube'
import {voiceCallCountQueryFactory} from 'models/reporting/queryFactories/voice/voiceCall'
import {StatsFilters} from 'models/stat/types'
import {getPreviousPeriod} from 'utils/reporting'

export const useVoiceCallCountTrend = (
    filters: StatsFilters,
    timezone: string,
    segment?: VoiceCallSegment
) =>
    useMetricTrend(
        voiceCallCountQueryFactory(filters, timezone, segment),
        voiceCallCountQueryFactory(
            {...filters, period: getPreviousPeriod(filters.period)},
            timezone,
            segment
        )
    )

export const fetchVoiceCallCountTrend = (
    filters: StatsFilters,
    timezone: string
) =>
    fetchMetricTrend(
        voiceCallCountQueryFactory(filters, timezone),
        voiceCallCountQueryFactory(
            {...filters, period: getPreviousPeriod(filters.period)},
            timezone
        )
    )

export const fetchVoiceCallCountOutboundTrend = (
    filters: StatsFilters,
    timezone: string
) =>
    fetchMetricTrend(
        voiceCallCountQueryFactory(
            filters,
            timezone,
            VoiceCallSegment.outboundCalls
        ),
        voiceCallCountQueryFactory(
            {...filters, period: getPreviousPeriod(filters.period)},
            timezone,
            VoiceCallSegment.outboundCalls
        )
    )

export const fetchVoiceCallCountInboundTrend = (
    filters: StatsFilters,
    timezone: string
) =>
    fetchMetricTrend(
        voiceCallCountQueryFactory(
            filters,
            timezone,
            VoiceCallSegment.inboundCalls
        ),
        voiceCallCountQueryFactory(
            {...filters, period: getPreviousPeriod(filters.period)},
            timezone,
            VoiceCallSegment.inboundCalls
        )
    )

export const fetchVoiceCallCountMissedTrend = (
    filters: StatsFilters,
    timezone: string
) =>
    fetchMetricTrend(
        voiceCallCountQueryFactory(
            filters,
            timezone,
            VoiceCallSegment.missedCalls
        ),
        voiceCallCountQueryFactory(
            {...filters, period: getPreviousPeriod(filters.period)},
            timezone,
            VoiceCallSegment.missedCalls
        )
    )
