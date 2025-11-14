import { assumeMock, renderHook } from '@repo/testing'

import { TicketChannel } from 'business/types/ticket'
import {
    fetchCustomFieldsTicketCountTimeSeries,
    fetchMessagesSentTimeSeries,
    fetchTagsTicketCountTimeSeries,
    fetchTicketsClosedTimeSeries,
    fetchTicketsCreatedTimeSeries,
    fetchTicketsRepliedTimeSeries,
    fetchTotalTaggedTicketCountTimeSeries,
    fetchZeroTouchTicketsTimeSeries,
    useAIIntentCustomFieldsTicketCountTimeSeries,
    useCustomFieldsTicketCountForProductTimeSeries,
    useCustomFieldsTicketCountTimeSeries,
    useMessagesSentTimeSeries,
    useSentimentsCustomFieldsTicketCountTimeSeries,
    useTagsTicketCountTimeSeries,
    useTicketsClosedTimeSeries,
    useTicketsCreatedTimeSeries,
    useTicketsRepliedTimeSeries,
    useTotalTaggedTicketCountTimeSeries,
} from 'domains/reporting/hooks/timeSeries'
import {
    fetchTimeSeries,
    fetchTimeSeriesPerDimension,
    useTimeSeries,
    useTimeSeriesPerDimension,
} from 'domains/reporting/hooks/useTimeSeries'
import { TicketProductsEnrichedDimension } from 'domains/reporting/models/cubes/core/TicketProductsEnrichedCube'
import { TicketMember } from 'domains/reporting/models/cubes/TicketCube'
import { closedTicketsTimeSeriesQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/closedTickets'
import { messagesSentTimeSeriesQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/messagesSent'
import { ticketsCreatedTimeSeriesQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/ticketsCreated'
import { ticketsRepliedTimeSeriesQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/ticketsReplied'
import { zeroTouchTicketsTimeSeriesQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/zeroTouchTickets'
import {
    customFieldsTicketCountForProductOnCreatedDatetimeTimeSeriesQueryFactory,
    customFieldsTicketCountOnCreatedDatetimeTimeSeriesQueryFactory,
    customFieldsTicketCountTimeSeriesQueryFactory,
} from 'domains/reporting/models/queryFactories/ticket-insights/customFieldsTicketCount'
import {
    tagsTicketCountOnCreatedDatetimeTimeSeriesFactory,
    tagsTicketCountTimeSeriesFactory,
    totalTaggedTicketCountOnCreatedDatetimeTimeSeriesFactory,
    totalTaggedTicketCountTimeSeriesFactory,
} from 'domains/reporting/models/queryFactories/ticket-insights/tagsTicketCount'
import {
    getCustomFieldValueSerializer,
    withDefaultLogicalOperator,
} from 'domains/reporting/models/queryFactories/utils'
import {
    sentMessagesTimeseries,
    sentMessagesTimeseriesQueryV2Factory,
} from 'domains/reporting/models/scopes/messagesSent'
import {
    closedTicketsTimeseries,
    closedTicketsTimeseriesQueryV2Factory,
} from 'domains/reporting/models/scopes/ticketsClosed'
import {
    createdTicketsTimeseries,
    createdTicketsTimeseriesQueryV2Factory,
} from 'domains/reporting/models/scopes/ticketsCreated'
import {
    ticketsRepliedTimeseries,
    ticketsRepliedTimeseriesQueryV2Factory,
} from 'domains/reporting/models/scopes/ticketsReplied'
import {
    Sentiment,
    StatsFilters,
    TagFilterInstanceId,
    TicketTimeReference,
} from 'domains/reporting/models/stat/types'
import {
    ReportingFilterOperator,
    ReportingGranularity,
} from 'domains/reporting/models/types'
import { OrderDirection } from 'models/api/types'

jest.mock('domains/reporting/hooks/useTimeSeries')
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
    const customFieldId = 1

    describe.each([
        [
            'useTicketsClosedTimeSeries',
            useTicketsClosedTimeSeries,
            closedTicketsTimeSeriesQueryFactory,
            closedTicketsTimeseries.build.bind(closedTicketsTimeseries),
        ],
        [
            'useTicketsCreatedTimeSeries',
            useTicketsCreatedTimeSeries,
            ticketsCreatedTimeSeriesQueryFactory,
            createdTicketsTimeseries.build.bind(createdTicketsTimeseries),
        ],
        [
            'useTicketsRepliedTimeSeries',
            useTicketsRepliedTimeSeries,
            ticketsRepliedTimeSeriesQueryFactory,
            ticketsRepliedTimeseries.build.bind(ticketsRepliedTimeseries),
        ],
        [
            'useMessagesSentTimeSeries',
            useMessagesSentTimeSeries,
            messagesSentTimeSeriesQueryFactory,
            sentMessagesTimeseries.build.bind(sentMessagesTimeseries),
        ],
    ])('%s', (_, useTrendFn, queryFactory, queryV2Factory) => {
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
                queryV2Factory?.({ filters, timezone, granularity }),
            )
        })
    })

    describe.each([
        [
            'fetchTicketsClosedTimeSeries',
            fetchTicketsClosedTimeSeries,
            closedTicketsTimeSeriesQueryFactory,
            closedTicketsTimeseriesQueryV2Factory,
        ],
        [
            'fetchTicketsCreatedTimeSeries',
            fetchTicketsCreatedTimeSeries,
            ticketsCreatedTimeSeriesQueryFactory,
            createdTicketsTimeseriesQueryV2Factory,
        ],
        [
            'fetchTicketsRepliedTimeSeries',
            fetchTicketsRepliedTimeSeries,
            ticketsRepliedTimeSeriesQueryFactory,
            ticketsRepliedTimeseriesQueryV2Factory,
        ],
        [
            'fetchMessagesSentTimeSeries',
            fetchMessagesSentTimeSeries,
            messagesSentTimeSeriesQueryFactory,
            sentMessagesTimeseriesQueryV2Factory,
        ],
        [
            'fetchZeroTouchTicketsTimeSeries',
            fetchZeroTouchTicketsTimeSeries,
            zeroTouchTicketsTimeSeriesQueryFactory,
        ],
    ])(
        '%s',
        (_testName, fetchTimeSeriesFn, queryFactory, queryV2Factory?: any) => {
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
                    queryV2Factory?.({ filters, timezone, granularity }),
                )
            })
        },
    )

    describe('getTimeSeriesFetch queryV2', () => {
        it('should call queryV2 with correct context when provided', async () => {
            const filters: StatsFilters = {
                period: {
                    start_datetime: '2021-05-29T00:00:00+02:00',
                    end_datetime: '2021-06-04T23:59:59+02:00',
                },
            }

            await fetchTicketsCreatedTimeSeries(filters, timezone, granularity)

            const expectedQueryV2Result =
                createdTicketsTimeseriesQueryV2Factory({
                    filters,
                    timezone,
                    granularity,
                })

            expect(fetchTimeSeriesMock).toHaveBeenCalledWith(
                ticketsCreatedTimeSeriesQueryFactory(
                    filters,
                    timezone,
                    granularity,
                ),
                expectedQueryV2Result,
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
            )
        })

        it('should accept time reference as a parameter', () => {
            renderHook(
                ({ statsFilters, timezone, granularity, customFieldId }) =>
                    useCustomFieldsTicketCountTimeSeries(
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

            expect(useTimeSeriesPerDimensionMock).toHaveBeenCalledWith(
                customFieldsTicketCountOnCreatedDatetimeTimeSeriesQueryFactory(
                    statsFilters,
                    timezone,
                    granularity,
                    customFieldId,
                ),
            )
        })

        it('should render expected query', () => {
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

    describe('useCustomFieldsTicketCountForProductTimeSeries', () => {
        const productId = 'some-product-id'
        it('should render expected query', () => {
            renderHook(() =>
                useCustomFieldsTicketCountForProductTimeSeries(
                    statsFilters,
                    timezone,
                    granularity,
                    customFieldId,
                    productId,
                ),
            )

            expect(useTimeSeriesPerDimensionMock).toHaveBeenCalledWith(
                customFieldsTicketCountForProductOnCreatedDatetimeTimeSeriesQueryFactory(
                    statsFilters,
                    timezone,
                    granularity,
                    customFieldId,
                    productId,
                ),
            )
        })
    })

    describe('useTotalTaggedTicketCountTimeSeries', () => {
        it('should render expected query', () => {
            renderHook(() =>
                useTotalTaggedTicketCountTimeSeries(
                    statsFilters,
                    timezone,
                    granularity,
                ),
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
            renderHook(() =>
                useTotalTaggedTicketCountTimeSeries(
                    statsFilters,
                    timezone,
                    granularity,
                    undefined,
                    TicketTimeReference.CreatedAt,
                ),
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
            renderHook(() =>
                fetchTotalTaggedTicketCountTimeSeries(
                    statsFilters,
                    timezone,
                    granularity,
                ),
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
            renderHook(() =>
                fetchTotalTaggedTicketCountTimeSeries(
                    statsFilters,
                    timezone,
                    granularity,
                    undefined,
                    TicketTimeReference.CreatedAt,
                ),
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

    describe('useSentimentsCustomFieldsTicketCountTimeSeries', () => {
        const sentimentCustomFieldId = 123
        const sentimentValueStrings = [Sentiment.Positive, Sentiment.Negative]
        const sorting = OrderDirection.Desc
        const baseQuery = customFieldsTicketCountTimeSeriesQueryFactory(
            statsFilters,
            timezone,
            granularity,
            sentimentCustomFieldId,
            sorting,
        )

        it('should call useTimeSeriesPerDimension with correct query and sentiment filters', () => {
            renderHook(() =>
                useSentimentsCustomFieldsTicketCountTimeSeries(
                    statsFilters,
                    timezone,
                    granularity,
                    sentimentCustomFieldId,
                    sentimentValueStrings,
                    sorting,
                ),
            )

            expect(useTimeSeriesPerDimensionMock).toHaveBeenCalledWith({
                ...baseQuery,
                filters: expect.arrayContaining([
                    ...baseQuery.filters,
                    {
                        member: TicketMember.CustomField,
                        operator: ReportingFilterOperator.Equals,
                        values: sentimentValueStrings.map(
                            getCustomFieldValueSerializer(
                                sentimentCustomFieldId,
                            ),
                        ),
                    },
                    {
                        member: TicketProductsEnrichedDimension.ProductId,
                        operator: ReportingFilterOperator.NotEquals,
                        values: ['null'],
                    },
                ]),
            })
        })
    })

    describe('useAIIntentCustomFieldsTicketCountTimeSeries', () => {
        const sorting = OrderDirection.Desc

        it('should call useTimeSeriesPerDimension with correct query and ProductId filter', () => {
            const baseQuery = customFieldsTicketCountTimeSeriesQueryFactory(
                statsFilters,
                timezone,
                granularity,
                customFieldId,
                sorting,
            )

            renderHook(() =>
                useAIIntentCustomFieldsTicketCountTimeSeries(
                    statsFilters,
                    timezone,
                    granularity,
                    customFieldId,
                    sorting,
                ),
            )

            expect(useTimeSeriesPerDimensionMock).toHaveBeenCalledWith({
                ...baseQuery,
                filters: [
                    ...baseQuery.filters,
                    {
                        member: TicketProductsEnrichedDimension.ProductId,
                        operator: ReportingFilterOperator.NotEquals,
                        values: ['null'],
                    },
                ],
            })
        })
    })
})
