import {renderHook} from '@testing-library/react-hooks'

import {TicketChannel, TicketMessageSourceType} from 'business/types/ticket'
import {
    AutomationBillingEventMeasures,
    AutomationBillingEventMember,
    HelpdeskMessageDimension,
    HelpdeskMessageMeasure,
    HelpdeskMessageMember,
    ReportingFilterOperator,
    ReportingGranularity,
    TicketMember,
} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'
import {assumeMock} from 'utils/testing'

import {
    useAutomatedInteractionByEventTypesTimeSeries,
    useAutomatedInteractionTimeSeries,
    useAutomationRateTimeSeries,
    useMessagesSentTimeSeries,
    useTicketsClosedTimeSeries,
    useTicketsCreatedTimeSeries,
    useTicketsRepliedTimeSeries,
} from '../timeSeries'
import useTimeSeries from '../useTimeSeries'

jest.mock('../useTimeSeries')
const useTimeSeriesMock = assumeMock(useTimeSeries)

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
        ['useTicketsCreatedTimeSeries', useTicketsCreatedTimeSeries],
        ['useTicketsClosedTimeSeries', useTicketsClosedTimeSeries],
    ])('%s', (_testName, useTrendFn) => {
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
                        {
                            member: TicketMember.IsSpam,
                            operator: ReportingFilterOperator.Equals,
                            values: ['0'],
                        },
                        {
                            member: TicketMember.IsTrashed,
                            operator: ReportingFilterOperator.Equals,
                            values: ['0'],
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
                            member: HelpdeskMessageMember.PeriodStart,
                            operator: ReportingFilterOperator.AfterDate,
                            values: [periodStart],
                        },
                        {
                            member: HelpdeskMessageMember.PeriodEnd,
                            operator: ReportingFilterOperator.BeforeDate,
                            values: [periodEnd],
                        },
                        {
                            member: TicketMember.PeriodEnd,
                            operator: ReportingFilterOperator.BeforeDate,
                            values: [periodEnd],
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
                [AutomationBillingEventMeasures.AutomationRate],
                useAutomationRateTimeSeries,
            ],
            [
                'useAutomatedInteractionTimeSeries',
                [AutomationBillingEventMeasures.AutomatedInteractions],
                useAutomatedInteractionTimeSeries,
            ],
            [
                'OverallTimeSaved',
                [
                    AutomationBillingEventMeasures.AutomatedInteractionsByTrackOrder,
                    AutomationBillingEventMeasures.AutomatedInteractionsByLoopReturns,
                    AutomationBillingEventMeasures.AutomatedInteractionsByQuickResponse,
                    AutomationBillingEventMeasures.AutomatedInteractionsByArticleRecommendation,
                    AutomationBillingEventMeasures.AutomatedInteractionsByAutomatedResponse,
                    AutomationBillingEventMeasures.AutomatedInteractionsByQuickResponseFlows,
                    AutomationBillingEventMeasures.AutomatedInteractionsByAutoResponders,
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
