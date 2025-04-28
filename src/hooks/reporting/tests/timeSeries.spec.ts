import { TicketChannel } from 'business/types/ticket'
import {
    fetchCustomFieldsTicketCountTimeSeries,
    fetchMessagesSentTimeSeries,
    fetchTagsTicketCountTimeSeries,
    fetchTicketsClosedTimeSeries,
    fetchTicketsCreatedTimeSeries,
    fetchTicketsRepliedTimeSeries,
    fetchTotalTaggedTicketCountTimeSeries,
    useCustomFieldsTicketCountTimeSeries,
    useMessagesSentTimeSeries,
    useTagsTicketCountTimeSeries,
    useTicketsClosedTimeSeries,
    useTicketsCreatedTimeSeries,
    useTicketsRepliedTimeSeries,
    useTotalTaggedTicketCountTimeSeries,
} from 'hooks/reporting/timeSeries'
import {
    fetchTimeSeries,
    fetchTimeSeriesPerDimension,
    useTimeSeries,
    useTimeSeriesPerDimension,
} from 'hooks/reporting/useTimeSeries'
import { closedTicketsTimeSeriesQueryFactory } from 'models/reporting/queryFactories/support-performance/closedTickets'
import { messagesSentTimeSeriesQueryFactory } from 'models/reporting/queryFactories/support-performance/messagesSent'
import { ticketsCreatedTimeSeriesQueryFactory } from 'models/reporting/queryFactories/support-performance/ticketsCreated'
import { ticketsRepliedTimeSeriesQueryFactory } from 'models/reporting/queryFactories/support-performance/ticketsReplied'
import {
    customFieldsTicketCountOnCreatedDatetimeTimeSeriesQueryFactory,
    customFieldsTicketCountTimeSeriesQueryFactory,
} from 'models/reporting/queryFactories/ticket-insights/customFieldsTicketCount'
import {
    tagsTicketCountOnCreatedDatetimeTimeSeriesFactory,
    tagsTicketCountTimeSeriesFactory,
    totalTaggedTicketCountOnCreatedDatetimeTimeSeriesFactory,
    totalTaggedTicketCountTimeSeriesFactory,
} from 'models/reporting/queryFactories/ticket-insights/tagsTicketCount'
import { withDefaultLogicalOperator } from 'models/reporting/queryFactories/utils'
import { ReportingGranularity } from 'models/reporting/types'
import {
    StatsFilters,
    TagFilterInstanceId,
    TicketTimeReference,
} from 'models/stat/types'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

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
    ])('%s', (_, useTrendFn, queryFactory) => {
        it('should use query factory for $testName', () => {
            const filters: StatsFilters = {
                period: {
                    start_datetime: '2021-05-29T00:00:00+02:00',
                    end_datetime: '2021-06-04T23:59:59+02:00',
                },
                channels: withDefaultLogicalOperator([
                    TicketChannel.Email,
                    TicketChannel.Chat,
                ]),
                integrations: withDefaultLogicalOperator([1]),
                agents: withDefaultLogicalOperator([2]),
                tags: [
                    {
                        ...withDefaultLogicalOperator([1, 2]),
                        filterInstanceId: TagFilterInstanceId.First,
                    },
                ],
            }

            renderHook(() => useTrendFn(filters, timezone, granularity))

            expect(useTimeSeriesMock).toHaveBeenCalledWith(
                queryFactory(filters, timezone, granularity),
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
            const filters: StatsFilters = {
                period: {
                    start_datetime: '2021-05-29T00:00:00+02:00',
                    end_datetime: '2021-06-04T23:59:59+02:00',
                },
                channels: withDefaultLogicalOperator([
                    TicketChannel.Email,
                    TicketChannel.Chat,
                ]),
                integrations: withDefaultLogicalOperator([1]),
                agents: withDefaultLogicalOperator([2]),
                tags: [
                    {
                        ...withDefaultLogicalOperator([1, 2]),
                        filterInstanceId: TagFilterInstanceId.First,
                    },
                ],
            }

            await fetchTimeSeriesFn(filters, timezone, granularity)

            expect(fetchTimeSeriesMock).toHaveBeenCalledWith(
                queryFactory(filters, timezone, granularity),
            )
        })
    })

    describe('useTagsTicketCountTimeSeries', () => {
        it('should render expected query', () => {
            renderHook(
                ({ statsFilters, timezone, granularity }) =>
                    useTagsTicketCountTimeSeries(
                        statsFilters,
                        timezone,
                        granularity,
                    ),
                {
                    initialProps: {
                        statsFilters,
                        timezone,
                        granularity,
                    },
                },
            )

            expect(useTimeSeriesPerDimensionMock).toHaveBeenCalledWith(
                tagsTicketCountTimeSeriesFactory(
                    statsFilters,
                    timezone,
                    granularity,
                ),
            )
        })

        it('should accept time reference as a parameter', () => {
            renderHook(
                ({ statsFilters, timezone, granularity }) =>
                    useTagsTicketCountTimeSeries(
                        statsFilters,
                        timezone,
                        granularity,
                        undefined,
                        TicketTimeReference.CreatedAt,
                    ),
                {
                    initialProps: {
                        statsFilters,
                        timezone,
                        granularity,
                    },
                },
            )

            expect(useTimeSeriesPerDimensionMock).toHaveBeenCalledWith(
                tagsTicketCountOnCreatedDatetimeTimeSeriesFactory(
                    statsFilters,
                    timezone,
                    granularity,
                ),
            )
        })

        it('returns correct query', () => {
            renderHook(
                ({ statsFilters, timezone, granularity }) =>
                    fetchTagsTicketCountTimeSeries(
                        statsFilters,
                        timezone,
                        granularity,
                        undefined,
                    ),
                {
                    initialProps: {
                        statsFilters,
                        timezone,
                        granularity,
                    },
                },
            )

            expect(fetchTimeSeriesPerDimensionMock).toHaveBeenCalledWith(
                tagsTicketCountTimeSeriesFactory(
                    statsFilters,
                    timezone,
                    granularity,
                ),
            )
        })

        it('returns correct query when time reference is created at', () => {
            renderHook(
                ({ statsFilters, timezone, granularity }) =>
                    fetchTagsTicketCountTimeSeries(
                        statsFilters,
                        timezone,
                        granularity,
                        undefined,
                        TicketTimeReference.CreatedAt,
                    ),
                {
                    initialProps: {
                        statsFilters,
                        timezone,
                        granularity,
                    },
                },
            )

            expect(fetchTimeSeriesPerDimensionMock).toHaveBeenCalledWith(
                tagsTicketCountOnCreatedDatetimeTimeSeriesFactory(
                    statsFilters,
                    timezone,
                    granularity,
                ),
            )
        })
    })

    describe('useCustomFieldsTicketCountTimeSeries', () => {
        it('should render expected query', () => {
            const customFieldId = '1'
            renderHook(
                ({ statsFilters, timezone, granularity, customFieldId }) =>
                    useCustomFieldsTicketCountTimeSeries(
                        statsFilters,
                        timezone,
                        granularity,
                        customFieldId,
                    ),
                {
                    initialProps: {
                        statsFilters,
                        timezone,
                        granularity,
                        customFieldId,
                    },
                },
            )

            expect(useTimeSeriesPerDimensionMock).toHaveBeenCalledWith(
                customFieldsTicketCountTimeSeriesQueryFactory(
                    statsFilters,
                    timezone,
                    granularity,
                    customFieldId,
                ),
                true,
            )
        })

        it('should accept time reference as a parameter', () => {
            const customFieldId = '1'
            renderHook(
                ({ statsFilters, timezone, granularity, customFieldId }) =>
                    useCustomFieldsTicketCountTimeSeries(
                        statsFilters,
                        timezone,
                        granularity,
                        customFieldId,
                        undefined,
                        true,
                        TicketTimeReference.CreatedAt,
                    ),
                {
                    initialProps: {
                        statsFilters,
                        timezone,
                        granularity,
                        customFieldId,
                    },
                },
            )

            expect(useTimeSeriesPerDimensionMock).toHaveBeenCalledWith(
                customFieldsTicketCountOnCreatedDatetimeTimeSeriesQueryFactory(
                    statsFilters,
                    timezone,
                    granularity,
                    customFieldId,
                ),
                true,
            )
        })

        it('should render expected query', () => {
            const customFieldId = '1'
            renderHook(
                ({ statsFilters, timezone, granularity, customFieldId }) =>
                    fetchCustomFieldsTicketCountTimeSeries(
                        statsFilters,
                        timezone,
                        granularity,
                        customFieldId,
                    ),
                {
                    initialProps: {
                        statsFilters,
                        timezone,
                        granularity,
                        customFieldId,
                    },
                },
            )

            expect(fetchTimeSeriesPerDimensionMock).toHaveBeenCalledWith(
                customFieldsTicketCountTimeSeriesQueryFactory(
                    statsFilters,
                    timezone,
                    granularity,
                    customFieldId,
                ),
            )
        })

        it('should accept time reference as a parameter', () => {
            const customFieldId = '1'
            renderHook(
                ({ statsFilters, timezone, granularity, customFieldId }) =>
                    fetchCustomFieldsTicketCountTimeSeries(
                        statsFilters,
                        timezone,
                        granularity,
                        customFieldId,
                        undefined,
                        TicketTimeReference.CreatedAt,
                    ),
                {
                    initialProps: {
                        statsFilters,
                        timezone,
                        granularity,
                        customFieldId,
                    },
                },
            )

            expect(fetchTimeSeriesPerDimensionMock).toHaveBeenCalledWith(
                customFieldsTicketCountOnCreatedDatetimeTimeSeriesQueryFactory(
                    statsFilters,
                    timezone,
                    granularity,
                    customFieldId,
                ),
            )
        })
    })

    describe('useTotalTaggedTicketCountTimeSeries', () => {
        it('should render expected query', () => {
            renderHook(
                ({ statsFilters, timezone, granularity }) =>
                    useTotalTaggedTicketCountTimeSeries(
                        statsFilters,
                        timezone,
                        granularity,
                    ),
                {
                    initialProps: {
                        statsFilters,
                        timezone,
                        granularity,
                    },
                },
            )

            expect(useTimeSeriesMock).toHaveBeenCalledWith(
                totalTaggedTicketCountTimeSeriesFactory(
                    statsFilters,
                    timezone,
                    granularity,
                ),
            )
        })

        it('should render expected query when time reference is created at', () => {
            renderHook(
                ({ statsFilters, timezone, granularity }) =>
                    useTotalTaggedTicketCountTimeSeries(
                        statsFilters,
                        timezone,
                        granularity,
                        undefined,
                        TicketTimeReference.CreatedAt,
                    ),
                {
                    initialProps: {
                        statsFilters,
                        timezone,
                        granularity,
                    },
                },
            )

            expect(useTimeSeriesMock).toHaveBeenCalledWith(
                totalTaggedTicketCountOnCreatedDatetimeTimeSeriesFactory(
                    statsFilters,
                    timezone,
                    granularity,
                ),
            )
        })

        it('should fetch expected query', () => {
            renderHook(
                ({ statsFilters, timezone, granularity }) =>
                    fetchTotalTaggedTicketCountTimeSeries(
                        statsFilters,
                        timezone,
                        granularity,
                    ),
                {
                    initialProps: {
                        statsFilters,
                        timezone,
                        granularity,
                    },
                },
            )

            expect(fetchTimeSeriesMock).toHaveBeenCalledWith(
                totalTaggedTicketCountTimeSeriesFactory(
                    statsFilters,
                    timezone,
                    granularity,
                ),
            )
        })

        it('should fetch expected query when time reference is created at', () => {
            renderHook(
                ({ statsFilters, timezone, granularity }) =>
                    fetchTotalTaggedTicketCountTimeSeries(
                        statsFilters,
                        timezone,
                        granularity,
                        undefined,
                        TicketTimeReference.CreatedAt,
                    ),
                {
                    initialProps: {
                        statsFilters,
                        timezone,
                        granularity,
                    },
                },
            )

            expect(fetchTimeSeriesMock).toHaveBeenCalledWith(
                totalTaggedTicketCountOnCreatedDatetimeTimeSeriesFactory(
                    statsFilters,
                    timezone,
                    granularity,
                ),
            )
        })
    })
})
