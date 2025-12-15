import { assumeMock, renderHook } from '@repo/testing'
import moment from 'moment/moment'

import { METRIC_NAMES, MetricScope } from 'domains/reporting/hooks/metricNames'
import useMetricTrend, {
    fetchMetricTrend,
} from 'domains/reporting/hooks/useMetricTrend'
import { VoiceCallSegment } from 'domains/reporting/models/cubes/VoiceCallCube'
import { voiceCallCountQueryFactory } from 'domains/reporting/models/queryFactories/voice/voiceCall'
import { voiceCallsCountQueryFactoryV2 } from 'domains/reporting/models/scopes/voiceCalls'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import {
    fetchVoiceCallCountInboundTrend,
    fetchVoiceCallCountOutboundTrend,
    fetchVoiceCallCountTrend,
    useVoiceCallCountTrend,
} from 'domains/reporting/pages/voice/hooks/useVoiceCallCountTrend'
import {
    formatReportingQueryDate,
    getPreviousPeriod,
} from 'domains/reporting/utils/reporting'

jest.mock('domains/reporting/hooks/useMetricTrend')
jest.mock('domains/reporting/models/scopes/voiceCalls')
const fetchMetricTrendMock = assumeMock(fetchMetricTrend)
const useMetricTrendMock = assumeMock(useMetricTrend)
const voiceCallsCountQueryFactoryV2Mock = assumeMock(
    voiceCallsCountQueryFactoryV2,
)

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
    const mockQueryV2Current: ReturnType<typeof voiceCallsCountQueryFactoryV2> =
        {
            metricName: METRIC_NAMES.VOICE_CALL_COUNT_TREND,
            scope: MetricScope.VoiceCalls,
            measures: ['voiceCallsCount'],
        }
    const mockQueryV2Previous: ReturnType<
        typeof voiceCallsCountQueryFactoryV2
    > = {
        metricName: METRIC_NAMES.VOICE_CALL_COUNT_TREND,
        scope: MetricScope.VoiceCalls,
        measures: ['voiceCallsCount'],
    }

    beforeEach(() => {
        jest.clearAllMocks()
        voiceCallsCountQueryFactoryV2Mock
            .mockReturnValueOnce(mockQueryV2Current)
            .mockReturnValueOnce(mockQueryV2Previous)
        useMetricTrendMock.mockReturnValue({
            isFetching: false,
            isError: false,
            data: { value: 100, prevValue: 80 },
        })
    })

    describe('useVoiceCallCountTrend hook', () => {
        it('should call useMetricTrend with V1 and V2 queries', () => {
            renderHook(() => useVoiceCallCountTrend(statsFilters, userTimezone))

            expect(voiceCallsCountQueryFactoryV2Mock).toHaveBeenCalledWith(
                {
                    filters: statsFilters,
                    timezone: userTimezone,
                },
                undefined,
                undefined,
                false,
            )
            expect(voiceCallsCountQueryFactoryV2Mock).toHaveBeenCalledWith(
                {
                    filters: {
                        ...statsFilters,
                        period: getPreviousPeriod(statsFilters.period),
                    },
                    timezone: userTimezone,
                },
                undefined,
                undefined,
                false,
            )
            expect(useMetricTrendMock).toHaveBeenCalledWith(
                voiceCallCountQueryFactory(
                    statsFilters,
                    userTimezone,
                    undefined,
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
                    undefined,
                    undefined,
                    undefined,
                    METRIC_NAMES.VOICE_CALL_COUNT_TREND,
                ),
                mockQueryV2Current,
                mockQueryV2Previous,
            )
        })

        it('should call useMetricTrend with segment parameter', () => {
            const segment = VoiceCallSegment.outboundCalls

            renderHook(() =>
                useVoiceCallCountTrend(statsFilters, userTimezone, segment),
            )

            expect(voiceCallsCountQueryFactoryV2Mock).toHaveBeenCalledWith(
                {
                    filters: statsFilters,
                    timezone: userTimezone,
                },
                segment,
                undefined,
                false,
            )
            expect(useMetricTrendMock).toHaveBeenCalledWith(
                voiceCallCountQueryFactory(
                    statsFilters,
                    userTimezone,
                    segment,
                    undefined,
                    undefined,
                    METRIC_NAMES.VOICE_CALL_COUNT_TREND,
                ),
                expect.any(Object),
                mockQueryV2Current,
                mockQueryV2Previous,
            )
        })
    })

    it('should use fetchVoiceCallCountTrend with V1 and V2 queries', async () => {
        await fetchVoiceCallCountTrend(statsFilters, userTimezone)

        expect(voiceCallsCountQueryFactoryV2Mock).toHaveBeenCalledWith(
            {
                filters: statsFilters,
                timezone: userTimezone,
            },
            undefined,
        )
        expect(voiceCallsCountQueryFactoryV2Mock).toHaveBeenCalledWith(
            {
                filters: {
                    ...statsFilters,
                    period: getPreviousPeriod(statsFilters.period),
                },
                timezone: userTimezone,
            },
            undefined,
        )
        expect(fetchMetricTrendMock).toHaveBeenCalledWith(
            voiceCallCountQueryFactory(
                statsFilters,
                userTimezone,
                undefined,
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
                undefined,
                undefined,
                undefined,
                METRIC_NAMES.VOICE_CALL_COUNT_TREND,
            ),
            mockQueryV2Current,
            mockQueryV2Previous,
        )
    })

    it.each([
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
        'should use voiceCallCountQueryFactory with V2 queries for segment ($segment)',
        async ({ fetch, segment, metricName }) => {
            await fetch(statsFilters, userTimezone)

            expect(voiceCallsCountQueryFactoryV2Mock).toHaveBeenCalledWith(
                {
                    filters: statsFilters,
                    timezone: userTimezone,
                },
                segment,
            )
            expect(voiceCallsCountQueryFactoryV2Mock).toHaveBeenCalledWith(
                {
                    filters: {
                        ...statsFilters,
                        period: getPreviousPeriod(statsFilters.period),
                    },
                    timezone: userTimezone,
                },
                segment,
            )
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
                mockQueryV2Current,
                mockQueryV2Previous,
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

            expect(voiceCallsCountQueryFactoryV2Mock).toHaveBeenCalledWith(
                {
                    filters: statsFilters,
                    timezone: userTimezone,
                },
                segment,
            )
            expect(voiceCallsCountQueryFactoryV2Mock).toHaveBeenCalledWith(
                {
                    filters: {
                        ...statsFilters,
                        period: getPreviousPeriod(statsFilters.period),
                    },
                    timezone: userTimezone,
                },
                segment,
            )
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
                mockQueryV2Current,
                mockQueryV2Previous,
            )
        },
    )
})
