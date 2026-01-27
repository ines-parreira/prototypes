import { assumeMock, renderHook } from '@repo/testing'
import moment from 'moment'

import {
    fetchBreachedSlaVoiceCallsTrend,
    fetchSlaAchievementRateVoiceCallsTrend,
    useBreachedSlaVoiceCallsTrend,
    useSlaAchievementRateVoiceCallsTrend,
} from 'domains/reporting/hooks/sla/useSLAsVoiceCallsTrends'
import useStatsMetricTrend, {
    fetchStatsMetricTrend,
} from 'domains/reporting/hooks/useStatsMetricTrend'
import {
    breachedVoiceCallsQueryV2Factory,
    voiceCallsSlaAchievementRateQueryV2Factory,
} from 'domains/reporting/models/scopes/voiceSLA'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import {
    formatReportingQueryDate,
    getPreviousPeriod,
} from 'domains/reporting/utils/reporting'

jest.mock('domains/reporting/hooks/useStatsMetricTrend')

const useStatsMetricTrendMock = assumeMock(useStatsMetricTrend)
const fetchStatsMetricTrendMock = assumeMock(fetchStatsMetricTrend)

describe('useSLAsVoiceCallsTrends', () => {
    const periodStart = formatReportingQueryDate(moment())
    const periodEnd = formatReportingQueryDate(moment())
    const statsFilters: StatsFilters = {
        period: {
            end_datetime: periodEnd,
            start_datetime: periodStart,
        },
    }
    const timezone = 'America/New_York'

    beforeEach(() => {
        jest.resetAllMocks()
    })

    describe('useBreachedSlaVoiceCallsTrend', () => {
        it('should pass query factories with two periods and return the result from useStatsMetricTrend', () => {
            const mockResult = {
                isFetching: false,
                isError: false,
                data: {
                    value: 42,
                    prevValue: 30,
                },
            }
            useStatsMetricTrendMock.mockReturnValue(mockResult)

            const { result } = renderHook(() =>
                useBreachedSlaVoiceCallsTrend(statsFilters, timezone),
            )

            expect(useStatsMetricTrendMock).toHaveBeenCalledWith(
                breachedVoiceCallsQueryV2Factory({
                    filters: statsFilters,
                    timezone,
                }),
                breachedVoiceCallsQueryV2Factory({
                    filters: {
                        ...statsFilters,
                        period: getPreviousPeriod(statsFilters.period),
                    },
                    timezone,
                }),
            )
            expect(result.current).toEqual(mockResult)
            expect(result.current.data?.value).toBe(42)
            expect(result.current.data?.prevValue).toBe(30)
        })
    })

    describe('fetchBreachedSlaVoiceCallsTrend', () => {
        it('should pass query factories with two periods and return the result from fetchStatsMetricTrend', async () => {
            const mockResult = {
                isFetching: false,
                isError: false,
                data: {
                    value: 50,
                    prevValue: 40,
                },
            }
            fetchStatsMetricTrendMock.mockResolvedValue(mockResult)

            const result = await fetchBreachedSlaVoiceCallsTrend(
                statsFilters,
                timezone,
            )

            expect(fetchStatsMetricTrendMock).toHaveBeenCalledWith(
                breachedVoiceCallsQueryV2Factory({
                    filters: statsFilters,
                    timezone,
                }),
                breachedVoiceCallsQueryV2Factory({
                    filters: {
                        ...statsFilters,
                        period: getPreviousPeriod(statsFilters.period),
                    },
                    timezone,
                }),
            )
            expect(result).toEqual(mockResult)
            expect(result.data?.value).toBe(50)
            expect(result.data?.prevValue).toBe(40)
        })
    })

    describe('useSlaAchievementRateVoiceCallsTrend', () => {
        it('should pass query factories with two periods and return the result from useStatsMetricTrend', () => {
            const mockResult = {
                isFetching: false,
                isError: false,
                data: {
                    value: 0.95,
                    prevValue: 0.92,
                },
            }
            useStatsMetricTrendMock.mockReturnValue(mockResult)

            const { result } = renderHook(() =>
                useSlaAchievementRateVoiceCallsTrend(statsFilters, timezone),
            )

            expect(useStatsMetricTrendMock).toHaveBeenCalledWith(
                voiceCallsSlaAchievementRateQueryV2Factory({
                    filters: statsFilters,
                    timezone,
                }),
                voiceCallsSlaAchievementRateQueryV2Factory({
                    filters: {
                        ...statsFilters,
                        period: getPreviousPeriod(statsFilters.period),
                    },
                    timezone,
                }),
            )
            expect(result.current).toEqual(mockResult)
            expect(result.current.data?.value).toBe(0.95)
            expect(result.current.data?.prevValue).toBe(0.92)
        })
    })

    describe('fetchSlaAchievementRateVoiceCallsTrend', () => {
        it('should pass query factories with two periods and return the result from fetchStatsMetricTrend', async () => {
            const mockResult = {
                isFetching: false,
                isError: false,
                data: {
                    value: 0.98,
                    prevValue: 0.95,
                },
            }
            fetchStatsMetricTrendMock.mockResolvedValue(mockResult)

            const result = await fetchSlaAchievementRateVoiceCallsTrend(
                statsFilters,
                timezone,
            )

            expect(fetchStatsMetricTrendMock).toHaveBeenCalledWith(
                voiceCallsSlaAchievementRateQueryV2Factory({
                    filters: statsFilters,
                    timezone,
                }),
                voiceCallsSlaAchievementRateQueryV2Factory({
                    filters: {
                        ...statsFilters,
                        period: getPreviousPeriod(statsFilters.period),
                    },
                    timezone,
                }),
            )
            expect(result).toEqual(mockResult)
            expect(result.data?.value).toBe(0.98)
            expect(result.data?.prevValue).toBe(0.95)
        })
    })
})
