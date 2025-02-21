import {renderHook} from '@testing-library/react-hooks'

import {
    fetchAutomationDatasetByEventTypeTimeSeries,
    fetchAutomationDatasetTimeSeries,
    fetchBillableTicketDatasetTimeSeries,
    useAutomationDatasetByEventTypeTimeSeries,
    useAutomationDatasetTimeSeries,
    useBillableTicketDatasetTimeSeries,
} from 'hooks/reporting/automate/timeSeries'
import {useAverageCSATScorePerDimensionTimeSeries} from 'hooks/reporting/quality-management/satisfaction/useAverageScorePerDimensionTimeSeries'
import {
    fetchTimeSeries,
    fetchTimeSeriesPerDimension,
    useTimeSeries,
    useTimeSeriesPerDimension,
} from 'hooks/reporting/useTimeSeries'
import {
    billableTicketDatasetExcludingAIAgentTimeSeriesQueryFactory,
    interactionsByEventTypeTimeSeriesQueryFactory,
    interactionsTimeSeriesQueryFactory,
} from 'models/reporting/queryFactories/automate_v2/timeseries'
import {averageCSATScorePerDimensionTimeSeriesFactory} from 'models/reporting/queryFactories/satisfaction/averageCSATScorePerDimensionQueryFactory'
import {ReportingGranularity} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'
import {assumeMock} from 'utils/testing'

jest.mock('hooks/reporting/useTimeSeries')
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
                ({statsFilters, timezone}) =>
                    useAutomationDatasetTimeSeries(
                        statsFilters,
                        timezone,
                        granularity
                    ),
                {initialProps: {statsFilters, timezone, granularity}}
            )

            expect(useTimeSeriesMock.mock.calls[0]).toEqual([
                interactionsTimeSeriesQueryFactory(
                    statsFilters,
                    timezone,
                    granularity
                ),
            ])
        })
    })

    describe('useAutomationDatasetTimeSeries', () => {
        it('should pass the query to the useTimeSeriesHook', () => {
            renderHook(
                ({statsFilters, timezone}) =>
                    useAutomationDatasetByEventTypeTimeSeries(
                        statsFilters,
                        timezone,
                        granularity
                    ),
                {initialProps: {statsFilters, timezone, granularity}}
            )

            expect(useTimeSeriesPerDimensionMock.mock.calls[0]).toEqual([
                interactionsByEventTypeTimeSeriesQueryFactory(
                    statsFilters,
                    timezone,
                    granularity
                ),
            ])
        })
    })

    describe('useBillableTicketDatasetTimeSeries', () => {
        it('should pass the query to the useTimeSeriesHook', () => {
            renderHook(
                ({statsFilters, timezone}) =>
                    useBillableTicketDatasetTimeSeries(
                        statsFilters,
                        timezone,
                        granularity
                    ),
                {initialProps: {statsFilters, timezone, granularity}}
            )

            expect(useTimeSeriesMock.mock.calls[0]).toEqual([
                billableTicketDatasetExcludingAIAgentTimeSeriesQueryFactory(
                    statsFilters,
                    timezone,
                    granularity
                ),
            ])
        })
    })

    describe('useAverageCSATScorePerDimensionTimeSeries', () => {
        it('should pass the query to the useTimeSeriesHook', () => {
            const dimension = 'some-dimension'
            renderHook(
                ({statsFilters, timezone, granularity}) =>
                    useAverageCSATScorePerDimensionTimeSeries(
                        dimension,
                        statsFilters,
                        timezone,
                        granularity
                    ),
                {
                    initialProps: {
                        statsFilters,
                        timezone,
                        granularity,
                    },
                }
            )

            expect(useTimeSeriesPerDimensionMock).toHaveBeenCalledWith(
                averageCSATScorePerDimensionTimeSeriesFactory(
                    dimension,
                    statsFilters,
                    timezone,
                    granularity
                )
            )
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
        ])(
            'should pass the respective query to the fetchTimeSeriesHook',
            async ({method, hook}) => {
                await method(statsFilters, timezone, granularity)

                expect(fetchTimeSeriesMock.mock.calls[0]).toEqual([
                    hook(statsFilters, timezone, granularity),
                ])
            }
        )

        it.each([
            {
                method: fetchAutomationDatasetByEventTypeTimeSeries,
                hook: interactionsByEventTypeTimeSeriesQueryFactory,
            },
        ])(
            'should pass the respective query to the fetchTimeSeriesHook',
            async ({method, hook}) => {
                await method(statsFilters, timezone, granularity)

                expect(fetchTimeSeriesPerDimensionMock.mock.calls[0]).toEqual([
                    hook(statsFilters, timezone, granularity),
                ])
            }
        )

        describe('fetchAutomationDatasetTimeSeries', () => {
            it('should pass the query to the useTimeSeriesHook', async () => {
                await fetchAutomationDatasetTimeSeries(
                    statsFilters,
                    timezone,
                    granularity
                )

                expect(fetchTimeSeriesMock.mock.calls[0]).toEqual([
                    interactionsTimeSeriesQueryFactory(
                        statsFilters,
                        timezone,
                        granularity
                    ),
                ])
            })
        })

        describe('fetchAutomationDatasetByEventTypeTimeSeries', () => {
            it('should pass the query to the useTimeSeriesHook', async () => {
                await fetchAutomationDatasetByEventTypeTimeSeries(
                    statsFilters,
                    timezone,
                    granularity
                )

                expect(fetchTimeSeriesPerDimensionMock.mock.calls[0]).toEqual([
                    interactionsByEventTypeTimeSeriesQueryFactory(
                        statsFilters,
                        timezone,
                        granularity
                    ),
                ])
            })
        })

        describe('fetchBillableTicketDatasetTimeSeries', () => {
            it('should pass the query to the useTimeSeriesHook', async () => {
                await fetchBillableTicketDatasetTimeSeries(
                    statsFilters,
                    timezone,
                    granularity
                )

                expect(fetchTimeSeriesMock.mock.calls[0]).toEqual([
                    billableTicketDatasetExcludingAIAgentTimeSeriesQueryFactory(
                        statsFilters,
                        timezone,
                        granularity
                    ),
                ])
            })
        })
    })
})
