import { assumeMock, renderHook } from '@repo/testing'
import moment from 'moment'

import { METRIC_NAMES, MetricScope } from 'domains/reporting/hooks/metricNames'
import useMetricTrend, {
    fetchMetricTrend,
} from 'domains/reporting/hooks/useMetricTrend'
import { voiceCallSlaAchievementRateQueryFactory } from 'domains/reporting/models/queryFactories/voice/voiceCall'
import { voiceCallsSlaAchievementRateQueryFactoryV2 } from 'domains/reporting/models/scopes/voiceCalls'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import {
    fetchVoiceCallSlaAchievementRateTrend,
    useVoiceCallSlaAchievementRateTrend,
} from 'domains/reporting/pages/voice/hooks/useVoiceCallSlaAchievementRateTrend'
import {
    formatReportingQueryDate,
    getPreviousPeriod,
} from 'domains/reporting/utils/reporting'

jest.mock('domains/reporting/hooks/useMetricTrend')
jest.mock('domains/reporting/models/queryFactories/voice/voiceCall')
jest.mock('domains/reporting/models/scopes/voiceCalls')

const fetchMetricTrendMock = assumeMock(fetchMetricTrend)
const useMetricTrendMock = assumeMock(useMetricTrend)
const voiceCallSlaAchievementRateQueryFactoryMock = assumeMock(
    voiceCallSlaAchievementRateQueryFactory,
)
const voiceCallsSlaAchievementRateQueryFactoryV2Mock = assumeMock(
    voiceCallsSlaAchievementRateQueryFactoryV2,
)

describe('useVoiceCallSlaAchievementRateTrend', () => {
    const periodStart = moment()
    const periodEnd = periodStart.clone().add(7, 'days')
    const statsFilters: StatsFilters = {
        period: {
            end_datetime: formatReportingQueryDate(periodEnd),
            start_datetime: formatReportingQueryDate(periodStart),
        },
    }
    const userTimezone = 'UTC'

    const mockV1Query: ReturnType<
        typeof voiceCallSlaAchievementRateQueryFactory
    > = {
        metricName: METRIC_NAMES.VOICE_CALL_SLA_ACHIEVEMENT_RATE,
        measures: [],
        dimensions: [],
        filters: [],
        timezone: 'UTC',
        segments: [],
    }

    const mockV2Query: ReturnType<
        typeof voiceCallsSlaAchievementRateQueryFactoryV2
    > = {
        metricName: METRIC_NAMES.VOICE_CALL_SLA_ACHIEVEMENT_RATE,
        scope: MetricScope.VoiceCalls,
        measures: ['slaAchievementRate'],
    }

    beforeEach(() => {
        jest.clearAllMocks()
        voiceCallSlaAchievementRateQueryFactoryMock.mockReturnValue(mockV1Query)
        voiceCallsSlaAchievementRateQueryFactoryV2Mock.mockReturnValue(
            mockV2Query,
        )
    })

    describe('useVoiceCallSlaAchievementRateTrend hook', () => {
        it('should call query factories with correct parameters', () => {
            renderHook(() =>
                useVoiceCallSlaAchievementRateTrend(statsFilters, userTimezone),
            )

            expect(
                voiceCallSlaAchievementRateQueryFactoryMock,
            ).toHaveBeenCalledWith(statsFilters, userTimezone)
            expect(
                voiceCallSlaAchievementRateQueryFactoryMock,
            ).toHaveBeenCalledWith(
                {
                    ...statsFilters,
                    period: getPreviousPeriod(statsFilters.period),
                },
                userTimezone,
            )
            expect(
                voiceCallsSlaAchievementRateQueryFactoryV2Mock,
            ).toHaveBeenCalledWith({
                filters: statsFilters,
                timezone: userTimezone,
            })
            expect(
                voiceCallsSlaAchievementRateQueryFactoryV2Mock,
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

    describe('fetchVoiceCallSlaAchievementRateTrend', () => {
        it('should use voiceCallSlaAchievementRateQueryFactory with V2 factories', async () => {
            await fetchVoiceCallSlaAchievementRateTrend(
                statsFilters,
                userTimezone,
            )

            expect(
                voiceCallSlaAchievementRateQueryFactoryMock,
            ).toHaveBeenCalledWith(statsFilters, userTimezone)
            expect(
                voiceCallSlaAchievementRateQueryFactoryMock,
            ).toHaveBeenCalledWith(
                {
                    ...statsFilters,
                    period: getPreviousPeriod(statsFilters.period),
                },
                userTimezone,
            )
            expect(
                voiceCallsSlaAchievementRateQueryFactoryV2Mock,
            ).toHaveBeenCalledWith({
                filters: statsFilters,
                timezone: userTimezone,
            })
            expect(
                voiceCallsSlaAchievementRateQueryFactoryV2Mock,
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
