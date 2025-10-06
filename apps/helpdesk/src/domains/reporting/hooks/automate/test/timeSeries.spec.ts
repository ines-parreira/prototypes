import { assumeMock, renderHook } from '@repo/testing'

import {
    fetchAutomationDatasetByEventTypeTimeSeries,
    fetchAutomationDatasetTimeSeries,
    fetchBillableTicketDatasetTimeSeries,
    fetchRecommendedResourcesTimeSeries,
    useAutomationDatasetByEventTypeTimeSeries,
    useAutomationDatasetTimeSeries,
    useBillableTicketDatasetTimeSeries,
} from 'domains/reporting/hooks/automate/timeSeries'
import {
    fetchTimeSeries,
    fetchTimeSeriesPerDimension,
    useTimeSeries,
    useTimeSeriesPerDimension,
} from 'domains/reporting/hooks/useTimeSeries'
import {
    articleRecommendedInteractionsTimeSeriesQueryFactory,
    billableTicketDatasetExcludingAIAgentTimeSeriesQueryFactory,
    interactionsByEventTypeTimeSeriesQueryFactory,
    interactionsTimeSeriesQueryFactory,
} from 'domains/reporting/models/queryFactories/automate_v2/timeseries'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import { ReportingGranularity } from 'domains/reporting/models/types'

jest.mock('domains/reporting/hooks/useTimeSeries')
const useTimeSeriesMock = assumeMock(useTimeSeries)
const fetchTimeSeriesMock = assumeMock(fetchTimeSeries)
const useTimeSeriesPerDimensionMock = assumeMock(useTimeSeriesPerDimension)
const fetchTimeSeriesPerDimensionMock = assumeMock(fetchTimeSeriesPerDimension)

describe('Automate V2 time series', () => {
    const periodStart = '2021-05-29T00:00:00.000'
    const periodEnd = '2021-06-04T23:59:59.000'
    const statsFilters: StatsFilters = {
        period: {
            start_datetime: periodStart,
            end_datetime: periodEnd,
        },
    }
    const timezone = 'UTC'
    const granularity = ReportingGranularity.Day

    describe('useAutomationDatasetTimeSeries', () => {
        it('should pass the query to the useTimeSeriesHook', () => {
            renderHook(
                ({ statsFilters, timezone }) =>
                    useAutomationDatasetTimeSeries(
                        statsFilters,
                        timezone,
                        granularity,
                    ),
                { initialProps: { statsFilters, timezone, granularity } },
            )

            expect(useTimeSeriesMock.mock.calls[0]).toEqual([
                interactionsTimeSeriesQueryFactory(
                    statsFilters,
                    timezone,
                    granularity,
                ),
            ])
        })
    })

    describe('useAutomationDatasetTimeSeries', () => {
        it('should pass the query to the useTimeSeriesHook', () => {
            renderHook(
                ({ statsFilters, timezone }) =>
                    useAutomationDatasetByEventTypeTimeSeries(
                        statsFilters,
                        timezone,
                        granularity,
                    ),
                { initialProps: { statsFilters, timezone, granularity } },
            )

            expect(useTimeSeriesPerDimensionMock.mock.calls[0]).toEqual([
                interactionsByEventTypeTimeSeriesQueryFactory(
                    statsFilters,
                    timezone,
                    granularity,
                ),
            ])
        })
    })

    describe('useBillableTicketDatasetTimeSeries', () => {
        it('should pass the query to the useTimeSeriesHook', () => {
            renderHook(
                ({ statsFilters, timezone }) =>
                    useBillableTicketDatasetTimeSeries(
                        statsFilters,
                        timezone,
                        granularity,
                    ),
                { initialProps: { statsFilters, timezone, granularity } },
            )

            expect(useTimeSeriesMock.mock.calls[0]).toEqual([
                billableTicketDatasetExcludingAIAgentTimeSeriesQueryFactory(
                    statsFilters,
                    timezone,
                    granularity,
                ),
            ])
        })
    })

    describe('fetch methods', () => {
        it.each([
            {
                method: fetchAutomationDatasetTimeSeries,
                hook: interactionsTimeSeriesQueryFactory,
            },

            {
                method: fetchBillableTicketDatasetTimeSeries,
                hook: billableTicketDatasetExcludingAIAgentTimeSeriesQueryFactory,
            },

            {
                method: fetchRecommendedResourcesTimeSeries,
                hook: articleRecommendedInteractionsTimeSeriesQueryFactory,
            },
        ])(
            'should pass the respective query to the fetchTimeSeriesHook',
            async ({ method, hook }) => {
                await method(statsFilters, timezone, granularity)

                expect(fetchTimeSeriesMock.mock.calls[0]).toEqual([
                    hook(statsFilters, timezone, granularity),
                ])
            },
        )

        it.each([
            {
                method: fetchAutomationDatasetByEventTypeTimeSeries,
                hook: interactionsByEventTypeTimeSeriesQueryFactory,
            },
        ])(
            'should pass the respective query to the fetchTimeSeriesHook',
            async ({ method, hook }) => {
                await method(statsFilters, timezone, granularity)

                expect(fetchTimeSeriesPerDimensionMock.mock.calls[0]).toEqual([
                    hook(statsFilters, timezone, granularity),
                ])
            },
        )

        describe('fetchAutomationDatasetTimeSeries', () => {
            it('should pass the query to the useTimeSeriesHook', async () => {
                await fetchAutomationDatasetTimeSeries(
                    statsFilters,
                    timezone,
                    granularity,
                )

                expect(fetchTimeSeriesMock.mock.calls[0]).toEqual([
                    interactionsTimeSeriesQueryFactory(
                        statsFilters,
                        timezone,
                        granularity,
                    ),
                ])
            })
        })

        describe('fetchAutomationDatasetByEventTypeTimeSeries', () => {
            it('should pass the query to the useTimeSeriesHook', async () => {
                await fetchAutomationDatasetByEventTypeTimeSeries(
                    statsFilters,
                    timezone,
                    granularity,
                )

                expect(fetchTimeSeriesPerDimensionMock.mock.calls[0]).toEqual([
                    interactionsByEventTypeTimeSeriesQueryFactory(
                        statsFilters,
                        timezone,
                        granularity,
                    ),
                ])
            })
        })

        describe('fetchBillableTicketDatasetTimeSeries', () => {
            it('should pass the query to the useTimeSeriesHook', async () => {
                await fetchBillableTicketDatasetTimeSeries(
                    statsFilters,
                    timezone,
                    granularity,
                )

                expect(fetchTimeSeriesMock.mock.calls[0]).toEqual([
                    billableTicketDatasetExcludingAIAgentTimeSeriesQueryFactory(
                        statsFilters,
                        timezone,
                        granularity,
                    ),
                ])
            })
        })

        describe('fetchRecommendedResourcesTimeSeries', () => {
            it('should pass the query to the fetchTimeSeries hook', async () => {
                await fetchRecommendedResourcesTimeSeries(
                    statsFilters,
                    timezone,
                    granularity,
                )

                expect(fetchTimeSeriesMock.mock.calls[0]).toEqual([
                    articleRecommendedInteractionsTimeSeriesQueryFactory(
                        statsFilters,
                        timezone,
                        granularity,
                    ),
                ])
            })
        })
    })
})
