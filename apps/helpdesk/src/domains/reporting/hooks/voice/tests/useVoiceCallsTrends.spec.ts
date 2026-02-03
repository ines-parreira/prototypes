import { assumeMock, renderHook } from '@repo/testing'
import moment from 'moment'

import useStatsMetricTrend, {
    fetchStatsMetricTrend,
} from 'domains/reporting/hooks/useStatsMetricTrend'
import {
    fetchAchievedExposuresVoiceCallsTrend,
    useAchievedExposuresVoiceCallsTrend,
} from 'domains/reporting/hooks/voice/useVoiceCallsTrends'
import { voiceCallsAchievedExposuresQueryFactoryV2 } from 'domains/reporting/models/scopes/voiceCalls'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import {
    formatReportingQueryDate,
    getPreviousPeriod,
} from 'domains/reporting/utils/reporting'

jest.mock('domains/reporting/hooks/useStatsMetricTrend')

const useStatsMetricTrendMock = assumeMock(useStatsMetricTrend)
const fetchStatsMetricTrendMock = assumeMock(fetchStatsMetricTrend)

describe('useVoiceCallsTrends', () => {
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

    describe('useAchievedExposuresVoiceCallsTrend', () => {
        it('should pass query factories with two periods and return the result from useStatsMetricTrend', () => {
            const mockResult = {
                isFetching: false,
                isError: false,
                data: {
                    value: 150,
                    prevValue: 120,
                },
            }
            useStatsMetricTrendMock.mockReturnValue(mockResult)

            const { result } = renderHook(() =>
                useAchievedExposuresVoiceCallsTrend(statsFilters, timezone),
            )

            expect(useStatsMetricTrendMock).toHaveBeenCalledWith(
                voiceCallsAchievedExposuresQueryFactoryV2({
                    filters: statsFilters,
                    timezone,
                }),
                voiceCallsAchievedExposuresQueryFactoryV2({
                    filters: {
                        ...statsFilters,
                        period: getPreviousPeriod(statsFilters.period),
                    },
                    timezone,
                }),
            )
            expect(result.current).toEqual(mockResult)
            expect(result.current.data?.value).toBe(150)
            expect(result.current.data?.prevValue).toBe(120)
        })
    })

    describe('fetchAchievedExposuresVoiceCallsTrend', () => {
        it('should pass query factories with two periods and return the result from fetchStatsMetricTrend', async () => {
            const mockResult = {
                isFetching: false,
                isError: false,
                data: {
                    value: 200,
                    prevValue: 180,
                },
            }
            fetchStatsMetricTrendMock.mockResolvedValue(mockResult)

            const result = await fetchAchievedExposuresVoiceCallsTrend(
                statsFilters,
                timezone,
            )

            expect(fetchStatsMetricTrendMock).toHaveBeenCalledWith(
                voiceCallsAchievedExposuresQueryFactoryV2({
                    filters: statsFilters,
                    timezone,
                }),
                voiceCallsAchievedExposuresQueryFactoryV2({
                    filters: {
                        ...statsFilters,
                        period: getPreviousPeriod(statsFilters.period),
                    },
                    timezone,
                }),
            )
            expect(result).toEqual(mockResult)
            expect(result.data?.value).toBe(200)
            expect(result.data?.prevValue).toBe(180)
        })
    })
})
