import { assumeMock, renderHook } from '@repo/testing'

import useMetricTrend, {
    fetchMetricTrend,
} from 'domains/reporting/hooks/useMetricTrend'
import { totalNumberProductRecommendationsQueryFactory } from 'domains/reporting/models/queryFactories/ai-sales-agent/metrics'
import { AISalesAgentTotalProductRecommendationsQueryFactoryV2 } from 'domains/reporting/models/scopes/AISalesAgentConversations'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import {
    fetchTotalProductRecommendations,
    useTotalProductRecommendations,
} from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useTotalProductRecommendations'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'

jest.mock('domains/reporting/hooks/useMetricTrend')

const fetchMetricTrendMock = assumeMock(fetchMetricTrend)
const useMetricTrendMock = assumeMock(useMetricTrend)

describe('totalProductRecommendations', () => {
    const statsFilters: StatsFilters = {
        period: {
            start_datetime: '2021-05-29T00:00:00.000',
            end_datetime: '2021-06-04T23:59:59.000',
        },
    }
    const timezone = 'UTC'

    const trendData = {
        data: { value: 101.2, prevValue: 50.4 },
        isFetching: false,
        isError: false,
    }

    beforeEach(() => {
        jest.clearAllMocks()
        useMetricTrendMock.mockReturnValue(trendData)
        fetchMetricTrendMock.mockResolvedValue(trendData)
    })

    describe('useTotalProductRecommendations', () => {
        it('should return the result of useMetricTrend', () => {
            const { result } = renderHook(() =>
                useTotalProductRecommendations(statsFilters, timezone),
            )

            expect(result.current).toEqual(trendData)
        })

        it('should pass current and previous period query factories to useMetricTrend', () => {
            renderHook(() =>
                useTotalProductRecommendations(statsFilters, timezone),
            )

            expect(useMetricTrendMock).toHaveBeenCalledWith(
                totalNumberProductRecommendationsQueryFactory(
                    statsFilters,
                    timezone,
                ),
                totalNumberProductRecommendationsQueryFactory(
                    {
                        ...statsFilters,
                        period: getPreviousPeriod(statsFilters.period),
                    },
                    timezone,
                ),
                AISalesAgentTotalProductRecommendationsQueryFactoryV2({
                    filters: statsFilters,
                    timezone,
                }),
                AISalesAgentTotalProductRecommendationsQueryFactoryV2({
                    filters: {
                        ...statsFilters,
                        period: getPreviousPeriod(statsFilters.period),
                    },
                    timezone,
                }),
            )
        })
    })

    describe('fetchTotalProductRecommendations', () => {
        it('should return the result of fetchMetricTrend', async () => {
            const result = await fetchTotalProductRecommendations(
                statsFilters,
                timezone,
            )

            expect(result).toEqual(trendData)
        })

        it('should pass current and previous period query factories to fetchMetricTrend', async () => {
            await fetchTotalProductRecommendations(statsFilters, timezone)

            expect(fetchMetricTrendMock).toHaveBeenCalledWith(
                totalNumberProductRecommendationsQueryFactory(
                    statsFilters,
                    timezone,
                ),
                totalNumberProductRecommendationsQueryFactory(
                    {
                        ...statsFilters,
                        period: getPreviousPeriod(statsFilters.period),
                    },
                    timezone,
                ),
                AISalesAgentTotalProductRecommendationsQueryFactoryV2({
                    filters: statsFilters,
                    timezone,
                }),
                AISalesAgentTotalProductRecommendationsQueryFactoryV2({
                    filters: {
                        ...statsFilters,
                        period: getPreviousPeriod(statsFilters.period),
                    },
                    timezone,
                }),
            )
        })
    })
})
