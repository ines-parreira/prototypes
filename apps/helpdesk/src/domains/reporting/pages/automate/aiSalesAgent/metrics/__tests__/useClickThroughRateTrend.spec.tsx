import { assumeMock, renderHook } from '@repo/testing'

import useStatsMetricTrend, {
    fetchStatsMetricTrend,
    getStatsTrendFetch,
    getStatsTrendHook,
} from 'domains/reporting/hooks/useStatsMetricTrend'
import { timesRecommendedQueryV2Factory } from 'domains/reporting/models/scopes/aiSalesAgentActivity'
import { aiSalesAgentUniqueClicksQueryFactoryV2 } from 'domains/reporting/models/scopes/convertCampaignEvents'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import {
    fetchClickThroughRateTrend,
    useClickThroughRateTrend,
} from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useClickThroughRateTrend'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'

jest.mock('domains/reporting/hooks/useStatsMetricTrend')

const useStatsMetricTrendMock = assumeMock(useStatsMetricTrend)
const fetchStatsMetricTrendMock = assumeMock(fetchStatsMetricTrend)
const getStatsTrendHookMock = assumeMock(getStatsTrendHook)
const getStatsTrendFetchMock = assumeMock(getStatsTrendFetch)

describe('clickThroughRateTrend', () => {
    const statsFilters: StatsFilters = {
        period: {
            start_datetime: '2021-05-29T00:00:00.000',
            end_datetime: '2021-06-04T23:59:59.000',
        },
    }
    const timezone = 'UTC'

    const clicksTrendData = {
        data: { value: 3, prevValue: 6 },
        isFetching: false,
        isError: false,
    }

    const recommendationsTrendData = {
        data: { value: 2, prevValue: 3 },
        isFetching: false,
        isError: false,
    }

    beforeEach(() => {
        jest.clearAllMocks()
        getStatsTrendHookMock.mockImplementation(
            (queryFactory) => (filters: StatsFilters, tz: string) =>
                useStatsMetricTrendMock(
                    queryFactory({ filters, timezone: tz }),
                    queryFactory({
                        filters: {
                            ...filters,
                            period: getPreviousPeriod(filters.period),
                        },
                        timezone: tz,
                    }),
                ),
        )
        getStatsTrendFetchMock.mockImplementation(
            (queryFactory) => (filters: StatsFilters, tz: string) =>
                fetchStatsMetricTrendMock(
                    queryFactory({ filters, timezone: tz }),
                    queryFactory({
                        filters: {
                            ...filters,
                            period: getPreviousPeriod(filters.period),
                        },
                        timezone: tz,
                    }),
                ),
        )
    })

    describe('useClickThroughRateTrend', () => {
        it('should return computed click rate from clicks and recommendations', () => {
            useStatsMetricTrendMock
                .mockReturnValueOnce(clicksTrendData)
                .mockReturnValueOnce(recommendationsTrendData)

            const { result } = renderHook(() =>
                useClickThroughRateTrend(statsFilters, timezone),
            )

            expect(result.current).toEqual({
                data: { value: 1.5, prevValue: 2 },
                isError: false,
                isFetching: false,
            })
        })

        it('should pass clicks queries to useStatsMetricTrend', () => {
            useStatsMetricTrendMock
                .mockReturnValueOnce(clicksTrendData)
                .mockReturnValueOnce(recommendationsTrendData)

            renderHook(() => useClickThroughRateTrend(statsFilters, timezone))

            expect(useStatsMetricTrendMock).toHaveBeenCalledWith(
                aiSalesAgentUniqueClicksQueryFactoryV2({
                    filters: statsFilters,
                    timezone,
                }),
                aiSalesAgentUniqueClicksQueryFactoryV2({
                    filters: {
                        ...statsFilters,
                        period: getPreviousPeriod(statsFilters.period),
                    },
                    timezone,
                }),
            )
        })

        it('should pass timesRecommended queries to useStatsMetricTrend', () => {
            useStatsMetricTrendMock
                .mockReturnValueOnce(clicksTrendData)
                .mockReturnValueOnce(recommendationsTrendData)

            renderHook(() => useClickThroughRateTrend(statsFilters, timezone))

            expect(useStatsMetricTrendMock).toHaveBeenCalledWith(
                timesRecommendedQueryV2Factory({
                    filters: statsFilters,
                    timezone,
                }),
                timesRecommendedQueryV2Factory({
                    filters: {
                        ...statsFilters,
                        period: getPreviousPeriod(statsFilters.period),
                    },
                    timezone,
                }),
            )
        })
    })

    describe('fetchClickThroughRateTrend', () => {
        it('should return computed click rate from clicks and recommendations', async () => {
            fetchStatsMetricTrendMock
                .mockResolvedValueOnce(clicksTrendData)
                .mockResolvedValueOnce(recommendationsTrendData)

            const result = await fetchClickThroughRateTrend(
                statsFilters,
                timezone,
            )

            expect(result).toEqual({
                data: { value: 1.5, prevValue: 2 },
                isError: false,
                isFetching: false,
            })
        })

        it('should pass clicks queries to fetchStatsMetricTrend', async () => {
            fetchStatsMetricTrendMock
                .mockResolvedValueOnce(clicksTrendData)
                .mockResolvedValueOnce(recommendationsTrendData)

            await fetchClickThroughRateTrend(statsFilters, timezone)

            expect(fetchStatsMetricTrendMock).toHaveBeenCalledWith(
                aiSalesAgentUniqueClicksQueryFactoryV2({
                    filters: statsFilters,
                    timezone,
                }),
                aiSalesAgentUniqueClicksQueryFactoryV2({
                    filters: {
                        ...statsFilters,
                        period: getPreviousPeriod(statsFilters.period),
                    },
                    timezone,
                }),
            )
        })

        it('should pass timesRecommended queries to fetchStatsMetricTrend', async () => {
            fetchStatsMetricTrendMock
                .mockResolvedValueOnce(clicksTrendData)
                .mockResolvedValueOnce(recommendationsTrendData)

            await fetchClickThroughRateTrend(statsFilters, timezone)

            expect(fetchStatsMetricTrendMock).toHaveBeenCalledWith(
                timesRecommendedQueryV2Factory({
                    filters: statsFilters,
                    timezone,
                }),
                timesRecommendedQueryV2Factory({
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
