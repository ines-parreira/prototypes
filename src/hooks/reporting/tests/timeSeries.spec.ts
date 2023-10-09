import {renderHook} from '@testing-library/react-hooks'

import {TicketChannel, TicketMessageSourceType} from 'business/types/ticket'
import {OrderDirection} from 'models/api/types'
import {
    AutomationBillingEventMeasure,
    AutomationBillingEventMember,
} from 'models/reporting/cubes/AutomationBillingEventCube'
import {
    HelpdeskMessageDimension,
    HelpdeskMessageMeasure,
    HelpdeskMessageMember,
} from 'models/reporting/cubes/HelpdeskMessageCube'
import {
    TicketDimension,
    TicketMeasure,
    TicketMember,
} from 'models/reporting/cubes/TicketCube'
import {
    TicketCustomFieldsDimension,
    TicketCustomFieldsMeasure,
    TicketCustomFieldsMember,
} from 'models/reporting/cubes/TicketCustomFieldsCube'
import {
    TicketMessagesMember,
    TicketMessagesSegment,
} from 'models/reporting/cubes/TicketMessagesCube'
import {
    ReportingFilterOperator,
    ReportingGranularity,
} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'
import {NotSpamNorTrashedTicketsFilter} from 'utils/reporting'
import {assumeMock} from 'utils/testing'

import {
    ticketsCreatedQueryFactory,
    useAutomatedInteractionByEventTypesTimeSeries,
    useAutomatedInteractionTimeSeries,
    useAutomationRateTimeSeries,
    useCustomFieldsTicketCountTimeSeries,
    useMessagesSentTimeSeries,
    useTicketsClosedTimeSeries,
    useTicketsCreatedTimeSeries,
    useTicketsRepliedTimeSeries,
} from '../timeSeries'
import useTimeSeries, {useTimeSeriesPerDimension} from '../useTimeSeries'

jest.mock('../useTimeSeries')
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
                renderHook(() =>
                    useTrendFn(
                        {
                            period: {
                                start_datetime: '2021-05-29T00:00:00+02:00',
                                end_datetime: '2021-06-04T23:59:59+02:00',
                            },
                            channels: [TicketChannel.Email, TicketChannel.Chat],
                            integrations: [1],
                            agents: [2],
                            tags: [1, 2],
                        },
                        'America/Los_angeles',
                        ReportingGranularity.Week
                    )
                )
                expect(useTimeSeriesMock.mock.calls[0]).toMatchSnapshot()
            })
        }
    )

    describe('ticketsCreatedQueryFactory', () => {
        it('should build expected query', () => {
            const query = ticketsCreatedQueryFactory(
                statsFilters,
                timezone,
                granularity
            )

            expect(query).toEqual({
                measures: [TicketMeasure.TicketCount],
                order: [[TicketDimension.CreatedDatetime, OrderDirection.Asc]],
                dimensions: [],
                filters: [
                    {
                        member: TicketMember.PeriodStart,
                        operator: ReportingFilterOperator.AfterDate,
                        values: [periodStart],
                    },
                    {
                        member: TicketMember.PeriodEnd,
                        operator: ReportingFilterOperator.BeforeDate,
                        values: [periodEnd],
                    },
                    ...NotSpamNorTrashedTicketsFilter,
                ],
                segments: [],
                timeDimensions: [
                    {
                        dimension: TicketDimension.CreatedDatetime,
                        granularity: ReportingGranularity.Day,
                        dateRange: [periodStart, periodEnd],
                    },
                ],
                timezone,
            })
        })

        it('should build expected query with Agents filter', () => {
            const agentIds = [1, 2]
            const filters = {
                ...statsFilters,
                agents: agentIds,
            }
            const query = ticketsCreatedQueryFactory(
                filters,
                timezone,
                granularity
            )

            expect(query).toEqual({
                measures: [TicketMeasure.TicketCount],
                order: [[TicketDimension.CreatedDatetime, OrderDirection.Asc]],
                dimensions: [],
                filters: [
                    {
                        member: TicketMember.PeriodStart,
                        operator: ReportingFilterOperator.AfterDate,
                        values: [periodStart],
                    },
                    {
                        member: TicketMember.PeriodEnd,
                        operator: ReportingFilterOperator.BeforeDate,
                        values: [periodEnd],
                    },
                    ...NotSpamNorTrashedTicketsFilter,
                    {
                        member: TicketMessagesMember.FirstHelpdeskMessageUserId,
                        operator: ReportingFilterOperator.Equals,
                        values: agentIds.map(String),
                    },
                    {
                        member: TicketMessagesMember.PeriodStart,
                        operator: ReportingFilterOperator.AfterDate,
                        values: [periodStart],
                    },
                ],
                segments: [TicketMessagesSegment.TicketCreatedByAgent],
                timeDimensions: [
                    {
                        dimension: TicketDimension.CreatedDatetime,
                        granularity: ReportingGranularity.Day,
                        dateRange: [periodStart, periodEnd],
                    },
                ],
                timezone,
            })
        })
    })

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

            expect(useTimeSeriesMock.mock.calls[0]).toEqual([
                ticketsCreatedQueryFactory(statsFilters, timezone, granularity),
            ])
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

            expect(useTimeSeriesMock.mock.calls[0]).toEqual([
                {
                    measures: [HelpdeskMessageMeasure.TicketCount],
                    dimensions: [],
                    filters: [
                        {
                            member: HelpdeskMessageMember.PeriodStart,
                            operator: ReportingFilterOperator.AfterDate,
                            values: [periodStart],
                        },
                        {
                            member: HelpdeskMessageMember.PeriodEnd,
                            operator: ReportingFilterOperator.BeforeDate,
                            values: [periodEnd],
                        },
                        ...NotSpamNorTrashedTicketsFilter,
                        {
                            member: TicketMember.PeriodStart,
                            operator: ReportingFilterOperator.AfterDate,
                            values: [periodStart],
                        },
                        {
                            member: TicketMember.PeriodEnd,
                            operator: ReportingFilterOperator.BeforeDate,
                            values: [periodEnd],
                        },
                        {
                            member: HelpdeskMessageMember.Channel,
                            operator: ReportingFilterOperator.NotEquals,
                            values: [TicketMessageSourceType.InternalNote],
                        },
                    ],
                    timeDimensions: [
                        {
                            dimension: HelpdeskMessageDimension.SentDatetime,
                            granularity: ReportingGranularity.Day,
                            dateRange: [periodStart, periodEnd],
                        },
                    ],
                    timezone,
                },
            ])
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

            expect(useTimeSeriesMock.mock.calls[0]).toEqual([
                {
                    measures: [HelpdeskMessageMeasure.MessageCount],
                    dimensions: [],
                    timeDimensions: [
                        {
                            dimension: HelpdeskMessageDimension.SentDatetime,
                            granularity: ReportingGranularity.Day,
                            dateRange: [periodStart, periodEnd],
                        },
                    ],
                    timezone,
                    filters: [
                        {
                            member: TicketMember.PeriodStart,
                            operator: ReportingFilterOperator.AfterDate,
                            values: [periodStart],
                        },
                        {
                            member: TicketMember.PeriodEnd,
                            operator: ReportingFilterOperator.BeforeDate,
                            values: [periodEnd],
                        },
                        {
                            member: HelpdeskMessageMember.PeriodStart,
                            operator: ReportingFilterOperator.AfterDate,
                            values: [periodStart],
                        },
                        {
                            member: HelpdeskMessageMember.PeriodEnd,
                            operator: ReportingFilterOperator.BeforeDate,
                            values: [periodEnd],
                        },
                    ],
                },
            ])
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

            expect(useTimeSeriesPerDimensionMock.mock.calls[0]).toEqual([
                {
                    measures: [
                        TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount,
                    ],
                    dimensions: [
                        TicketCustomFieldsDimension.TicketCustomFieldsValueString,
                    ],
                    timezone,
                    segments: [],
                    filters: [
                        ...NotSpamNorTrashedTicketsFilter,
                        {
                            member: TicketMember.PeriodStart,
                            operator: ReportingFilterOperator.AfterDate,
                            values: [periodStart],
                        },
                        {
                            member: TicketMember.PeriodEnd,
                            operator: ReportingFilterOperator.BeforeDate,
                            values: [periodEnd],
                        },
                        {
                            member: TicketCustomFieldsMember.TicketCustomFieldsCustomFieldId,
                            operator: ReportingFilterOperator.Equals,
                            values: [customFieldId],
                        },
                        {
                            member: TicketCustomFieldsMember.TicketCustomFieldsCustomFieldUpdatedDatetime,
                            operator: ReportingFilterOperator.InDateRange,
                            values: [periodStart, periodEnd],
                        },
                    ],
                    timeDimensions: [
                        {
                            dimension:
                                TicketCustomFieldsMember.TicketCustomFieldsCustomFieldUpdatedDatetime,
                            granularity: ReportingGranularity.Day,
                            dateRange: [periodStart, periodEnd],
                        },
                    ],
                },
            ])
        })
    })

    describe('Automation add-on', () => {
        const aaoTimeSeriesIterator = describe.each([
            [
                'useAutomationRateTimeSeries',
                [AutomationBillingEventMeasure.AutomationRate],
                useAutomationRateTimeSeries,
            ],
            [
                'useAutomatedInteractionTimeSeries',
                [AutomationBillingEventMeasure.AutomatedInteractions],
                useAutomatedInteractionTimeSeries,
            ],
            [
                'OverallTimeSaved',
                [
                    AutomationBillingEventMeasure.AutomatedInteractionsByTrackOrder,
                    AutomationBillingEventMeasure.AutomatedInteractionsByLoopReturns,
                    AutomationBillingEventMeasure.AutomatedInteractionsByQuickResponse,
                    AutomationBillingEventMeasure.AutomatedInteractionsByArticleRecommendation,
                    AutomationBillingEventMeasure.AutomatedInteractionsByAutomatedResponse,
                    AutomationBillingEventMeasure.AutomatedInteractionsByQuickResponseFlows,
                    AutomationBillingEventMeasure.AutomatedInteractionsByAutoResponders,
                ],
                useAutomatedInteractionByEventTypesTimeSeries,
            ],
        ])
        aaoTimeSeriesIterator('%s', (_testName, measures, useTimeSeries) => {
            it('should render expected query', () => {
                renderHook(
                    ({statsFilters, timezone}) =>
                        useTimeSeries(statsFilters, timezone, granularity),
                    {initialProps: {statsFilters, timezone, granularity}}
                )

                expect(useTimeSeriesMock.mock.calls[0]).toEqual([
                    {
                        measures,
                        dimensions: [],
                        filters: [
                            {
                                member: AutomationBillingEventMember.PeriodStart,
                                operator: ReportingFilterOperator.AfterDate,
                                values: [periodStart],
                            },
                            {
                                member: AutomationBillingEventMember.PeriodEnd,
                                operator: ReportingFilterOperator.BeforeDate,
                                values: [periodEnd],
                            },

                            {
                                member: AutomationBillingEventMember.PeriodEnd,
                                operator: ReportingFilterOperator.BeforeDate,
                                values: [periodEnd],
                            },
                        ],
                        timeDimensions: [
                            {
                                dimension:
                                    AutomationBillingEventMember.CreatedDate,
                                granularity: ReportingGranularity.Day,
                                dateRange: [periodStart, periodEnd],
                            },
                        ],
                        timezone,
                    },
                ])
            })
        })
        aaoTimeSeriesIterator('%s', (_testName, _measures, useTimeSeries) => {
            it('should render expected query snapshot', () => {
                renderHook(
                    ({timezone}) =>
                        useTimeSeries(
                            {
                                period: {
                                    start_datetime: '2021-05-29T00:00:00+02:00',
                                    end_datetime: '2021-06-04T23:59:59+02:00',
                                },
                                channels: [
                                    TicketChannel.HelpCenter,
                                    TicketChannel.Chat,
                                ],
                            },
                            timezone,
                            granularity
                        ),
                    {initialProps: {statsFilters, timezone, granularity}}
                )

                expect(useTimeSeriesMock.mock.calls[0]).toMatchSnapshot()
            })
        })
    })
})
