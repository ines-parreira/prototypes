import {renderHook} from '@testing-library/react-hooks'

import {TicketChannel} from 'business/types/ticket'

import {
    fetchCustomFieldsTicketCountTimeSeries,
    fetchMessagesSentTimeSeries,
    fetchTicketsClosedTimeSeries,
    fetchTicketsCreatedTimeSeries,
    fetchTicketsRepliedTimeSeries,
    useAutomationDatasetByEventTypeTimeSeries,
    useAutomationDatasetTimeSeries,
    useBillableTicketDatasetTimeSeries,
    useCustomFieldsTicketCountTimeSeries,
    useMessagesSentTimeSeries,
    useTagsTicketCountTimeSeries,
    useTicketsClosedTimeSeries,
    useTicketsCreatedTimeSeries,
    useTicketsRepliedTimeSeries,
} from 'hooks/reporting/timeSeries'
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
import {closedTicketsTimeSeriesQueryFactory} from 'models/reporting/queryFactories/support-performance/closedTickets'
import {messagesSentTimeSeriesQueryFactory} from 'models/reporting/queryFactories/support-performance/messagesSent'
import {ticketsCreatedTimeSeriesQueryFactory} from 'models/reporting/queryFactories/support-performance/ticketsCreated'
import {ticketsRepliedTimeSeriesQueryFactory} from 'models/reporting/queryFactories/support-performance/ticketsReplied'
import {customFieldsTicketCountTimeSeriesQueryFactory} from 'models/reporting/queryFactories/ticket-insights/customFieldsTicketCount'
import {tagsTicketCountTimeSeriesFactory} from 'models/reporting/queryFactories/ticket-insights/tagsTicketCount'
import {ReportingGranularity} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'
import {assumeMock} from 'utils/testing'

import {useAverageCSATScorePerDimensionTimeSeries} from '../quality-management/satisfaction/useAverageScorePerDimensionTimeSeries'

jest.mock('hooks/reporting/useTimeSeries')
const useTimeSeriesMock = assumeMock(useTimeSeries)
const fetchTimeSeriesMock = assumeMock(fetchTimeSeries)
const useTimeSeriesPerDimensionMock = assumeMock(useTimeSeriesPerDimension)
const fetchTimeSeriesPerDimensionMock = assumeMock(fetchTimeSeriesPerDimension)

describe('time series', () => {
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

    describe.each([
        [
            'useTicketsClosedTimeSeries',
            useTicketsClosedTimeSeries,
            closedTicketsTimeSeriesQueryFactory,
        ],
        [
            'useTicketsCreatedTimeSeries',
            useTicketsCreatedTimeSeries,
            ticketsCreatedTimeSeriesQueryFactory,
        ],
        [
            'useTicketsRepliedTimeSeries',
            useTicketsRepliedTimeSeries,
            ticketsRepliedTimeSeriesQueryFactory,
        ],
        [
            'useMessagesSentTimeSeries',
            useMessagesSentTimeSeries,
            messagesSentTimeSeriesQueryFactory,
        ],
    ])('%s', (testName, useTrendFn, queryFactory) => {
        it('should use query factory for $testName', () => {
            const filters = {
                period: {
                    start_datetime: '2021-05-29T00:00:00+02:00',
                    end_datetime: '2021-06-04T23:59:59+02:00',
                },
                channels: [TicketChannel.Email, TicketChannel.Chat],
                integrations: [1],
                agents: [2],
                tags: [1, 2],
            }

            renderHook(() => useTrendFn(filters, timezone, granularity))

            expect(useTimeSeriesMock).toHaveBeenCalledWith(
                queryFactory(filters, timezone, granularity)
            )
        })
    })

    describe.each([
        [
            'fetchTicketsClosedTimeSeries',
            fetchTicketsClosedTimeSeries,
            closedTicketsTimeSeriesQueryFactory,
        ],
        [
            'fetchTicketsCreatedTimeSeries',
            fetchTicketsCreatedTimeSeries,
            ticketsCreatedTimeSeriesQueryFactory,
        ],
        [
            'fetchTicketsRepliedTimeSeries',
            fetchTicketsRepliedTimeSeries,
            ticketsRepliedTimeSeriesQueryFactory,
        ],
        [
            'fetchMessagesSentTimeSeries',
            fetchMessagesSentTimeSeries,
            messagesSentTimeSeriesQueryFactory,
        ],
    ])('%s', (_testName, fetchTimeSeriesFn, queryFactory) => {
        it('should use fetchMethod $testName', async () => {
            const filters = {
                period: {
                    start_datetime: '2021-05-29T00:00:00+02:00',
                    end_datetime: '2021-06-04T23:59:59+02:00',
                },
                channels: [TicketChannel.Email, TicketChannel.Chat],
                integrations: [1],
                agents: [2],
                tags: [1, 2],
            }

            await fetchTimeSeriesFn(filters, timezone, granularity)

            expect(fetchTimeSeriesMock).toHaveBeenCalledWith(
                queryFactory(filters, timezone, granularity)
            )
        })
    })

    describe('useTagsTicketCountTimeSeries', () => {
        it('should render expected query', () => {
            renderHook(
                ({statsFilters, timezone, granularity}) =>
                    useTagsTicketCountTimeSeries(
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
                tagsTicketCountTimeSeriesFactory(
                    statsFilters,
                    timezone,
                    granularity
                )
            )
        })
    })

    describe('useCustomFieldsTicketCountTimeSeries', () => {
        it('should render expected query', () => {
            const customFieldId = '1'
            renderHook(
                ({statsFilters, timezone, granularity, customFieldId}) =>
                    useCustomFieldsTicketCountTimeSeries(
                        statsFilters,
                        timezone,
                        granularity,
                        customFieldId
                    ),
                {
                    initialProps: {
                        statsFilters,
                        timezone,
                        granularity,
                        customFieldId,
                    },
                }
            )

            expect(useTimeSeriesPerDimensionMock).toHaveBeenCalledWith(
                customFieldsTicketCountTimeSeriesQueryFactory(
                    statsFilters,
                    timezone,
                    granularity,
                    customFieldId
                ),
                true
            )
        })

        it('should render expected query', () => {
            const customFieldId = '1'
            renderHook(
                ({statsFilters, timezone, granularity, customFieldId}) =>
                    fetchCustomFieldsTicketCountTimeSeries(
                        statsFilters,
                        timezone,
                        granularity,
                        customFieldId
                    ),
                {
                    initialProps: {
                        statsFilters,
                        timezone,
                        granularity,
                        customFieldId,
                    },
                }
            )

            expect(fetchTimeSeriesPerDimensionMock).toHaveBeenCalledWith(
                customFieldsTicketCountTimeSeriesQueryFactory(
                    statsFilters,
                    timezone,
                    granularity,
                    customFieldId
                )
            )
        })
    })

    describe('Automate V2', () => {
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
    })
})
