import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import useMetricTrend, {
    fetchMetricTrend,
} from 'domains/reporting/hooks/useMetricTrend'
import { VoiceCallSegment } from 'domains/reporting/models/cubes/VoiceCallCube'
import { voiceCallCountQueryFactory } from 'domains/reporting/models/queryFactories/voice/voiceCall'
import { voiceCallsCountQueryFactoryV2 } from 'domains/reporting/models/scopes/voiceCalls'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'

export const useVoiceCallCountTrend = (
    filters: StatsFilters,
    timezone: string,
    segment?: VoiceCallSegment,
) =>
    useMetricTrend(
        voiceCallCountQueryFactory(
            filters,
            timezone,
            segment,
            undefined,
            undefined,
            METRIC_NAMES.VOICE_CALL_COUNT_TREND,
        ),
        voiceCallCountQueryFactory(
            { ...filters, period: getPreviousPeriod(filters.period) },
            timezone,
            segment,
            undefined,
            undefined,
            METRIC_NAMES.VOICE_CALL_COUNT_TREND,
        ),
        voiceCallsCountQueryFactoryV2(
            {
                filters,
                timezone,
            },
            segment,
            undefined,
            false,
        ),
        voiceCallsCountQueryFactoryV2(
            {
                filters: {
                    ...filters,
                    period: getPreviousPeriod(filters.period),
                },
                timezone,
            },
            segment,
            undefined,
            false,
        ),
    )

export const fetchVoiceCallCountTrend = (
    filters: StatsFilters,
    timezone: string,
    segment?: VoiceCallSegment,
) =>
    fetchMetricTrend(
        voiceCallCountQueryFactory(
            filters,
            timezone,
            segment,
            undefined,
            undefined,
            METRIC_NAMES.VOICE_CALL_COUNT_TREND,
        ),
        voiceCallCountQueryFactory(
            { ...filters, period: getPreviousPeriod(filters.period) },
            timezone,
            segment,
            undefined,
            undefined,
            METRIC_NAMES.VOICE_CALL_COUNT_TREND,
        ),
        voiceCallsCountQueryFactoryV2(
            {
                filters,
                timezone,
            },
            segment,
        ),
        voiceCallsCountQueryFactoryV2(
            {
                filters: {
                    ...filters,
                    period: getPreviousPeriod(filters.period),
                },
                timezone,
            },
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
            undefined,
            undefined,
            METRIC_NAMES.VOICE_CALL_COUNT_OUTBOUND_TREND,
        ),
        voiceCallCountQueryFactory(
            { ...filters, period: getPreviousPeriod(filters.period) },
            timezone,
            VoiceCallSegment.outboundCalls,
            undefined,
            undefined,
            METRIC_NAMES.VOICE_CALL_COUNT_OUTBOUND_TREND,
        ),
        voiceCallsCountQueryFactoryV2(
            {
                filters,
                timezone,
            },
            VoiceCallSegment.outboundCalls,
        ),
        voiceCallsCountQueryFactoryV2(
            {
                filters: {
                    ...filters,
                    period: getPreviousPeriod(filters.period),
                },
                timezone,
            },
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
            undefined,
            undefined,
            METRIC_NAMES.VOICE_CALL_COUNT_INBOUND_TREND,
        ),
        voiceCallCountQueryFactory(
            { ...filters, period: getPreviousPeriod(filters.period) },
            timezone,
            VoiceCallSegment.inboundCalls,
            undefined,
            undefined,
            METRIC_NAMES.VOICE_CALL_COUNT_INBOUND_TREND,
        ),
        voiceCallsCountQueryFactoryV2(
            {
                filters,
                timezone,
            },
            VoiceCallSegment.inboundCalls,
        ),
        voiceCallsCountQueryFactoryV2(
            {
                filters: {
                    ...filters,
                    period: getPreviousPeriod(filters.period),
                },
                timezone,
            },
            VoiceCallSegment.inboundCalls,
        ),
    )
