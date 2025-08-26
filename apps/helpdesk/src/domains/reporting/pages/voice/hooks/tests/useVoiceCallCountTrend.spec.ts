import { assumeMock } from '@repo/testing'
import moment from 'moment/moment'

import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import { fetchMetricTrend } from 'domains/reporting/hooks/useMetricTrend'
import { VoiceCallSegment } from 'domains/reporting/models/cubes/VoiceCallCube'
import { voiceCallCountQueryFactory } from 'domains/reporting/models/queryFactories/voice/voiceCall'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import {
    fetchVoiceCallCountInboundTrend,
    fetchVoiceCallCountOutboundTrend,
    fetchVoiceCallCountTrend,
} from 'domains/reporting/pages/voice/hooks/useVoiceCallCountTrend'
import {
    formatReportingQueryDate,
    getPreviousPeriod,
} from 'domains/reporting/utils/reporting'

jest.mock('domains/reporting/hooks/useMetricTrend')
const fetchMetricTrendMock = assumeMock(fetchMetricTrend)

describe('VoiceCallCountTrend', () => {
    const periodStart = moment()
    const periodEnd = periodStart.add(7, 'days')
    const statsFilters: StatsFilters = {
        period: {
            end_datetime: formatReportingQueryDate(periodStart),
            start_datetime: formatReportingQueryDate(periodEnd),
        },
    }
    const userTimezone = 'UTC'

    it.each([
        {
            fetch: fetchVoiceCallCountTrend,
            segment: undefined,
            metricName: METRIC_NAMES.VOICE_CALL_COUNT_TREND,
        },
        {
            fetch: fetchVoiceCallCountOutboundTrend,
            segment: VoiceCallSegment.outboundCalls,
            metricName: METRIC_NAMES.VOICE_CALL_COUNT_OUTBOUND_TREND,
        },
        {
            fetch: fetchVoiceCallCountInboundTrend,
            segment: VoiceCallSegment.inboundCalls,
            metricName: METRIC_NAMES.VOICE_CALL_COUNT_INBOUND_TREND,
        },
    ])(
        'should use voiceCallCountQueryFactory with specific segment ($segment)',
        async ({ fetch, segment, metricName }) => {
            await fetch(statsFilters, userTimezone)

            expect(fetchMetricTrendMock).toHaveBeenCalledWith(
                voiceCallCountQueryFactory(
                    statsFilters,
                    userTimezone,
                    segment,
                    undefined,
                    undefined,
                    metricName,
                ),
                voiceCallCountQueryFactory(
                    {
                        ...statsFilters,
                        period: getPreviousPeriod(statsFilters.period),
                    },
                    userTimezone,
                    segment,
                    undefined,
                    undefined,
                    metricName,
                ),
            )
        },
    )

    it.each([
        {
            segment: VoiceCallSegment.inboundUnansweredCalls,
        },
        {
            segment: VoiceCallSegment.inboundMissedCalls,
        },
        {
            segment: VoiceCallSegment.inboundAbandonedCalls,
        },
        {
            segment: VoiceCallSegment.inboundCancelledCalls,
        },
    ])(
        'should use fetchVoiceCallCountTrend to fetch voice call count of specific segment ($segment)',
        async ({ segment }) => {
            await fetchVoiceCallCountTrend(statsFilters, userTimezone, segment)

            expect(fetchMetricTrendMock).toHaveBeenCalledWith(
                voiceCallCountQueryFactory(
                    statsFilters,
                    userTimezone,
                    segment,
                    undefined,
                    undefined,
                    METRIC_NAMES.VOICE_CALL_COUNT_TREND,
                ),
                voiceCallCountQueryFactory(
                    {
                        ...statsFilters,
                        period: getPreviousPeriod(statsFilters.period),
                    },
                    userTimezone,
                    segment,
                    undefined,
                    undefined,
                    METRIC_NAMES.VOICE_CALL_COUNT_TREND,
                ),
            )
        },
    )
})
