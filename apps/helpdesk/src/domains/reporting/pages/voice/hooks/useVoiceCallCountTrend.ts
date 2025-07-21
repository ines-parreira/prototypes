import useMetricTrend, {
    fetchMetricTrend,
} from 'domains/reporting/hooks/useMetricTrend'
import { VoiceCallSegment } from 'domains/reporting/models/cubes/VoiceCallCube'
import { voiceCallCountQueryFactory } from 'domains/reporting/models/queryFactories/voice/voiceCall'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'

export const useVoiceCallCountTrend = (
    filters: StatsFilters,
    timezone: string,
    segment?: VoiceCallSegment,
) =>
    useMetricTrend(
        voiceCallCountQueryFactory(filters, timezone, segment),
        voiceCallCountQueryFactory(
            { ...filters, period: getPreviousPeriod(filters.period) },
            timezone,
            segment,
        ),
    )

export const fetchVoiceCallCountTrend = (
    filters: StatsFilters,
    timezone: string,
    segment?: VoiceCallSegment,
) =>
    fetchMetricTrend(
        voiceCallCountQueryFactory(filters, timezone, segment),
        voiceCallCountQueryFactory(
            { ...filters, period: getPreviousPeriod(filters.period) },
            timezone,
            segment,
        ),
    )

export const fetchVoiceCallCountOutboundTrend = (
    filters: StatsFilters,
    timezone: string,
) =>
    fetchMetricTrend(
        voiceCallCountQueryFactory(
            filters,
            timezone,
            VoiceCallSegment.outboundCalls,
        ),
        voiceCallCountQueryFactory(
            { ...filters, period: getPreviousPeriod(filters.period) },
            timezone,
            VoiceCallSegment.outboundCalls,
        ),
    )

export const fetchVoiceCallCountInboundTrend = (
    filters: StatsFilters,
    timezone: string,
) =>
    fetchMetricTrend(
        voiceCallCountQueryFactory(
            filters,
            timezone,
            VoiceCallSegment.inboundCalls,
        ),
        voiceCallCountQueryFactory(
            { ...filters, period: getPreviousPeriod(filters.period) },
            timezone,
            VoiceCallSegment.inboundCalls,
        ),
    )
