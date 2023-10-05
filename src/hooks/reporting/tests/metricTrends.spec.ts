import {renderHook} from '@testing-library/react-hooks'
import moment from 'moment'
import {
    HelpdeskMessageMeasure,
    HelpdeskMessageMember,
} from 'models/reporting/cubes/HelpdeskMessageCube'
import {TicketMember} from 'models/reporting/cubes/TicketCube'
import {ReportingFilterOperator, ReportingQuery} from 'models/reporting/types'
import {TicketChannel, TicketMessageSourceType} from 'business/types/ticket'
import {StatsFilters} from 'models/stat/types'
import {formatReportingQueryDate} from 'utils/reporting'
import {
    AutomationBillingEventMeasure,
    AutomationBillingEventMember,
} from 'models/reporting/cubes/AutomationBillingEventCube'
import {
    automatedInteractionsQueryFactory,
    automationRateQueryFactory,
    firstResponseTimeWithAutomationQueryFactory,
    messagesSentQueryFactory,
    NotSpamNorTrashedTicketsFilter,
    overallTimeSavedWithAutomationQueryFactory,
    resolutionTimeWithAutomationQueryFactory,
    ticketsRepliedQueryFactory,
    useAutomatedInteractionsTrend,
    useAutomationRateTrend,
    useClosedTicketsTrend,
    useCustomerSatisfactionTrend,
    useFirstResponseTimeTrend,
    useFirstResponseTimeWithAutomationTrend,
    useMessagesPerTicketTrend,
    useOverallTimeSavedWithAutomationTrend,
    useResolutionTimeTrend,
    useResolutionTimeWithAutomationTrend,
    useTicketsCreatedTrend,
} from '../metricTrends'

jest.mock('../useMetricTrend', () => (queryCreator: ReportingQuery) => ({
    ...queryCreator,
}))

describe('metric trends', () => {
    describe.each([
        ['useCustomerSatisfactionTrend', useCustomerSatisfactionTrend],
        ['useFirstResponseTimeTrend', useFirstResponseTimeTrend],
        ['useMessagesPerTicketTrend', useMessagesPerTicketTrend],
        ['useResolutionTimeTrend', useResolutionTimeTrend],
        ['useClosedTicketsTrend', useClosedTicketsTrend],
        ['useTicketsCreatedTrend', useTicketsCreatedTrend],
    ])('%s', (_testName, useTrendFn) => {
        it('should create reporting filters', () => {
            const {result} = renderHook(() =>
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
                    'UTC'
                )
            )
            expect(result.current).toMatchSnapshot()
        })
    })

    const periodStart = formatReportingQueryDate(moment())
    const periodEnd = formatReportingQueryDate(moment())
    const statsFilters: StatsFilters = {
        period: {
            end_datetime: periodEnd,
            start_datetime: periodStart,
        },
    }
    const timezone = 'someTimeZone'

    describe('ticketsRepliedQueryFactory', () => {
        it('should build a query', () => {
            const query = ticketsRepliedQueryFactory(statsFilters, timezone)

            expect(query).toEqual({
                dimensions: [],
                measures: [HelpdeskMessageMeasure.TicketCount],
                filters: [
                    ...NotSpamNorTrashedTicketsFilter,
                    {
                        member: HelpdeskMessageMember.SentDatetime,
                        operator: ReportingFilterOperator.InDateRange,
                        values: [periodStart, periodEnd],
                    },
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
                        member: TicketMember.Channel,
                        operator: ReportingFilterOperator.NotEquals,
                        values: [TicketMessageSourceType.InternalNote],
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
                timezone,
            })
        })
    })

    describe('messagesSentQueryFactory', () => {
        it('should create a query', () => {
            const query = messagesSentQueryFactory(statsFilters, timezone)

            expect(query).toEqual({
                measures: [HelpdeskMessageMeasure.MessageCount],
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
                    {
                        member: HelpdeskMessageMember.SentDatetime,
                        operator: ReportingFilterOperator.InDateRange,
                        values: [periodStart, periodEnd],
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
                timezone,
            })
        })
    })

    describe('Automation add-on', () => {
        const statsFilters: StatsFilters = {
            period: {
                end_datetime: periodEnd,
                start_datetime: periodStart,
            },
        }
        describe.each([
            [
                'FirstResponseTimeWithAutomation',
                AutomationBillingEventMeasure.FirstResponseTimeWithAutomation,
                firstResponseTimeWithAutomationQueryFactory,
            ],
            [
                'ResolutionTimeWithAutomation',
                AutomationBillingEventMeasure.ResolutionTimeWithAutomation,
                resolutionTimeWithAutomationQueryFactory,
            ],
            [
                'OverallTimeSaved',
                AutomationBillingEventMeasure.OverallTimeSaved,
                overallTimeSavedWithAutomationQueryFactory,
            ],
            [
                'AutomationRate',
                AutomationBillingEventMeasure.AutomationRate,
                automationRateQueryFactory,
            ],
            [
                'AutomatedInteractions',
                AutomationBillingEventMeasure.AutomatedInteractions,
                automatedInteractionsQueryFactory,
            ],
        ])('%s', (_testName, kpi, getAutomationFactory) => {
            it('should create a query', () => {
                const query = getAutomationFactory(statsFilters, timezone)

                expect(query).toEqual({
                    measures: [kpi],
                    dimensions: [],
                    filters: [
                        {
                            member: AutomationBillingEventMember.CreatedDate,
                            operator: ReportingFilterOperator.InDateRange,
                            values: [periodStart, periodEnd],
                        },
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
                    ],
                    timezone,
                })
            })
        })
        describe.each([
            [
                'useFirstResponseTimeWithAutomationTrend',
                useFirstResponseTimeWithAutomationTrend,
            ],
            [
                'useResolutionTimeWithAutomationTrend',
                useResolutionTimeWithAutomationTrend,
            ],
            [
                'useOverallTimeSavedWithAutomationTrend',
                useOverallTimeSavedWithAutomationTrend,
            ],
            ['useAutomationRateTrend', useAutomationRateTrend],
            ['useAutomatedInteractionTrend', useAutomatedInteractionsTrend],
        ])('%s', (_testName, useTrendFn) => {
            it('should create automation filters', () => {
                const {result} = renderHook(() =>
                    useTrendFn(
                        {
                            period: {
                                start_datetime: '2021-05-29T00:00:00+02:00',
                                end_datetime: '2021-06-04T23:59:59+02:00',
                            },
                            channels: [],
                            integrations: [],
                            agents: [],
                            tags: [],
                        },
                        'UTC'
                    )
                )
                expect(result.current).toMatchSnapshot()
            })
        })
    })
})
