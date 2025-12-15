import { assumeMock, renderHook } from '@repo/testing'
import moment from 'moment'

import { METRIC_NAMES, MetricScope } from 'domains/reporting/hooks/metricNames'
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
import {
    fetchVoiceCallAverageTimeTalkTimeTrend,
    fetchVoiceCallAverageTimeWaitTimeTrend,
    useVoiceCallAverageTimeTrend,
} from 'domains/reporting/pages/voice/hooks/useVoiceCallAverageTimeTrend'
import { VoiceCallAverageTimeMetric } from 'domains/reporting/pages/voice/models/types'
import {
    formatReportingQueryDate,
    getPreviousPeriod,
} from 'domains/reporting/utils/reporting'

jest.mock('domains/reporting/hooks/useMetricTrend')
jest.mock('domains/reporting/models/queryFactories/voice/voiceCall')
jest.mock('domains/reporting/models/scopes/voiceCalls')

const fetchMetricTrendMock = assumeMock(fetchMetricTrend)
const useMetricTrendMock = assumeMock(useMetricTrend)
const voiceCallAverageTalkTimeQueryFactoryMock = assumeMock(
    voiceCallAverageTalkTimeQueryFactory,
)
const voiceCallAverageWaitTimeQueryFactoryMock = assumeMock(
    voiceCallAverageWaitTimeQueryFactory,
)
const voiceCallsAverageTalkTimeQueryFactoryV2Mock = assumeMock(
    voiceCallsAverageTalkTimeQueryFactoryV2,
)
const voiceCallsAverageWaitTimeQueryFactoryV2Mock = assumeMock(
    voiceCallsAverageWaitTimeQueryFactoryV2,
)

describe('useVoiceCallAverageTimeTrend', () => {
    const periodStart = moment()
    const periodEnd = periodStart.add(7, 'days')
    const statsFilters: StatsFilters = {
        period: {
            end_datetime: formatReportingQueryDate(periodStart),
            start_datetime: formatReportingQueryDate(periodEnd),
        },
    }
    const userTimezone = 'UTC'

    const mockV1TalkTimeQuery: ReturnType<
        typeof voiceCallAverageTalkTimeQueryFactory
    > = {
        metricName: METRIC_NAMES.VOICE_CALL_AVERAGE_TALK_TIME,
        measures: [],
        dimensions: [],
        filters: [],
        timezone: 'UTC',
        segments: [],
    }
    const mockV1WaitTimeQuery: ReturnType<
        typeof voiceCallAverageWaitTimeQueryFactory
    > = {
        metricName: METRIC_NAMES.VOICE_CALL_AVERAGE_WAIT_TIME,
        measures: [],
        dimensions: [],
        filters: [],
        timezone: 'UTC',
        segments: [],
    }
    const mockV2TalkTimeQuery: ReturnType<
        typeof voiceCallsAverageTalkTimeQueryFactoryV2
    > = {
        metricName: METRIC_NAMES.VOICE_CALL_AVERAGE_TALK_TIME,
        scope: MetricScope.VoiceCalls,
        measures: ['averageTalkTimeInSeconds'],
    }
    const mockV2WaitTimeQuery: ReturnType<
        typeof voiceCallsAverageWaitTimeQueryFactoryV2
    > = {
        metricName: METRIC_NAMES.VOICE_CALL_AVERAGE_WAIT_TIME,
        scope: MetricScope.VoiceCalls,
        measures: ['averageWaitTimeInSeconds'],
    }

    beforeEach(() => {
        jest.clearAllMocks()
        voiceCallAverageTalkTimeQueryFactoryMock.mockReturnValue(
            mockV1TalkTimeQuery,
        )
        voiceCallAverageWaitTimeQueryFactoryMock.mockReturnValue(
            mockV1WaitTimeQuery,
        )
        voiceCallsAverageTalkTimeQueryFactoryV2Mock.mockReturnValue(
            mockV2TalkTimeQuery,
        )
        voiceCallsAverageWaitTimeQueryFactoryV2Mock.mockReturnValue(
            mockV2WaitTimeQuery,
        )
    })

    describe('useVoiceCallAverageTimeTrend hook', () => {
        it('should use TalkTime factories when metric is TalkTime', () => {
            renderHook(() =>
                useVoiceCallAverageTimeTrend(
                    VoiceCallAverageTimeMetric.TalkTime,
                    statsFilters,
                    userTimezone,
                ),
            )

            expect(
                voiceCallAverageTalkTimeQueryFactoryMock,
            ).toHaveBeenCalledWith(statsFilters, userTimezone)
            expect(
                voiceCallAverageTalkTimeQueryFactoryMock,
            ).toHaveBeenCalledWith(
                {
                    ...statsFilters,
                    period: getPreviousPeriod(statsFilters.period),
                },
                userTimezone,
            )
            expect(
                voiceCallsAverageTalkTimeQueryFactoryV2Mock,
            ).toHaveBeenCalledWith({
                filters: statsFilters,
                timezone: userTimezone,
            })
            expect(
                voiceCallsAverageTalkTimeQueryFactoryV2Mock,
            ).toHaveBeenCalledWith({
                filters: {
                    ...statsFilters,
                    period: getPreviousPeriod(statsFilters.period),
                },
                timezone: userTimezone,
            })
            expect(useMetricTrendMock).toHaveBeenCalled()
        })

        it('should use WaitTime factories when metric is WaitTime', () => {
            renderHook(() =>
                useVoiceCallAverageTimeTrend(
                    VoiceCallAverageTimeMetric.WaitTime,
                    statsFilters,
                    userTimezone,
                ),
            )

            expect(
                voiceCallAverageWaitTimeQueryFactoryMock,
            ).toHaveBeenCalledWith(statsFilters, userTimezone)
            expect(
                voiceCallAverageWaitTimeQueryFactoryMock,
            ).toHaveBeenCalledWith(
                {
                    ...statsFilters,
                    period: getPreviousPeriod(statsFilters.period),
                },
                userTimezone,
            )
            expect(
                voiceCallsAverageWaitTimeQueryFactoryV2Mock,
            ).toHaveBeenCalledWith({
                filters: statsFilters,
                timezone: userTimezone,
            })
            expect(
                voiceCallsAverageWaitTimeQueryFactoryV2Mock,
            ).toHaveBeenCalledWith({
                filters: {
                    ...statsFilters,
                    period: getPreviousPeriod(statsFilters.period),
                },
                timezone: userTimezone,
            })
            expect(useMetricTrendMock).toHaveBeenCalled()
        })
    })

    describe('fetchVoiceCallAverageTimeWaitTimeTrend', () => {
        it('should use voiceCallAverageWaitTimeQueryFactory with V2 factories', async () => {
            await fetchVoiceCallAverageTimeWaitTimeTrend(
                statsFilters,
                userTimezone,
            )

            expect(
                voiceCallAverageWaitTimeQueryFactoryMock,
            ).toHaveBeenCalledWith(statsFilters, userTimezone)
            expect(
                voiceCallAverageWaitTimeQueryFactoryMock,
            ).toHaveBeenCalledWith(
                {
                    ...statsFilters,
                    period: getPreviousPeriod(statsFilters.period),
                },
                userTimezone,
            )
            expect(
                voiceCallsAverageWaitTimeQueryFactoryV2Mock,
            ).toHaveBeenCalledWith({
                filters: statsFilters,
                timezone: userTimezone,
            })
            expect(
                voiceCallsAverageWaitTimeQueryFactoryV2Mock,
            ).toHaveBeenCalledWith({
                filters: {
                    ...statsFilters,
                    period: getPreviousPeriod(statsFilters.period),
                },
                timezone: userTimezone,
            })
            expect(fetchMetricTrendMock).toHaveBeenCalled()
        })
    })

    describe('fetchVoiceCallAverageTimeTalkTimeTrend', () => {
        it('should use voiceCallAverageTalkTimeQueryFactory with V2 factories', async () => {
            await fetchVoiceCallAverageTimeTalkTimeTrend(
                statsFilters,
                userTimezone,
            )

            expect(
                voiceCallAverageTalkTimeQueryFactoryMock,
            ).toHaveBeenCalledWith(statsFilters, userTimezone)
            expect(
                voiceCallAverageTalkTimeQueryFactoryMock,
            ).toHaveBeenCalledWith(
                {
                    ...statsFilters,
                    period: getPreviousPeriod(statsFilters.period),
                },
                userTimezone,
            )
            expect(
                voiceCallsAverageTalkTimeQueryFactoryV2Mock,
            ).toHaveBeenCalledWith({
                filters: statsFilters,
                timezone: userTimezone,
            })
            expect(
                voiceCallsAverageTalkTimeQueryFactoryV2Mock,
            ).toHaveBeenCalledWith({
                filters: {
                    ...statsFilters,
                    period: getPreviousPeriod(statsFilters.period),
                },
                timezone: userTimezone,
            })
            expect(fetchMetricTrendMock).toHaveBeenCalled()
        })
    })
})
