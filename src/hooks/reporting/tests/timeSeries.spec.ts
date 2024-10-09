import {renderHook} from '@testing-library/react-hooks'

import {TicketChannel} from 'business/types/ticket'

import {closedTicketsTimeSeriesQueryFactory} from 'models/reporting/queryFactories/support-performance/closedTickets'
import {customFieldsTicketCountTimeSeriesQueryFactory} from 'models/reporting/queryFactories/ticket-insights/customFieldsTicketCount'
import {messagesSentTimeSeriesQueryFactory} from 'models/reporting/queryFactories/support-performance/messagesSent'
import {ticketsCreatedTimeSeriesQueryFactory} from 'models/reporting/queryFactories/support-performance/ticketsCreated'
import {ticketsRepliedTimeSeriesQueryFactory} from 'models/reporting/queryFactories/support-performance/ticketsReplied'
import {tagsTicketCountTimeSeriesFactory} from 'models/reporting/queryFactories/ticket-insights/tagsTicketCount'
import {ReportingGranularity} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'
import {assumeMock} from 'utils/testing'

import {
    billableTicketDatasetExcludingAIAgentTimeSeriesQueryFactory,
    interactionsByEventTypeTimeSeriesQueryFactory,
    interactionsTimeSeriesQueryFactory,
} from 'models/reporting/queryFactories/automate_v2/timeseries'
import {
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
    useTimeSeries,
    useTimeSeriesPerDimension,
} from 'hooks/reporting/useTimeSeries'

jest.mock('hooks/reporting/useTimeSeries')
const useTimeSeriesMock = assumeMock(useTimeSeries)
const useTimeSeriesPerDimensionMock = assumeMock(useTimeSeriesPerDimension)

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

    describe.each([['useTicketsClosedTimeSeries', useTicketsClosedTimeSeries]])(
        '%s',
        (_testName, useTrendFn) => {
            it('should create reporting filters', () => {
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
                    closedTicketsTimeSeriesQueryFactory(
                        filters,
                        timezone,
                        granularity
                    )
                )
            })
        }
    )

    describe('useTicketsCreatedTimeSeries', () => {
        it('should pass the query to the useTimeSeriesHook', () => {
            renderHook(
                ({statsFilters, timezone}) =>
                    useTicketsCreatedTimeSeries(
                        statsFilters,
                        timezone,
                        granularity
                    ),
                {initialProps: {statsFilters, timezone, granularity}}
            )

            expect(useTimeSeriesMock).toHaveBeenCalledWith(
                ticketsCreatedTimeSeriesQueryFactory(
                    statsFilters,
                    timezone,
                    granularity
                )
            )
        })
    })

    describe('useTicketsRepliedTimeSeries', () => {
        it('should render expected query', () => {
            renderHook(
                ({statsFilters, timezone}) =>
                    useTicketsRepliedTimeSeries(
                        statsFilters,
                        timezone,
                        granularity
                    ),
                {initialProps: {statsFilters, timezone, granularity}}
            )

            expect(useTimeSeriesMock).toHaveBeenCalledWith(
                ticketsRepliedTimeSeriesQueryFactory(
                    statsFilters,
                    timezone,
                    granularity
                )
            )
        })
    })

    describe('useMessagesSentTimeSeries', () => {
        it('should render expected query', () => {
            renderHook(
                ({statsFilters, timezone}) =>
                    useMessagesSentTimeSeries(
                        statsFilters,
                        timezone,
                        granularity
                    ),
                {initialProps: {statsFilters, timezone, granularity}}
            )

            expect(useTimeSeriesMock).toHaveBeenCalledWith(
                messagesSentTimeSeriesQueryFactory(
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
                )
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
    })
})
