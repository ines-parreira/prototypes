import {renderHook} from '@testing-library/react-hooks'
import moment from 'moment'
import {
    HelpdeskMessageMeasure,
    HelpdeskMessageMember,
    ReportingFilterOperator,
    TicketMember,
} from 'models/reporting/types'
import {TicketChannel, TicketMessageSourceType} from 'business/types/ticket'
import {StatsFilters} from 'models/stat/types'
import {formatReportingQueryDate} from 'utils/reporting'
import {
    getMessagesSentQueryFactory,
    getTicketsRepliedQueryFactory,
    NotSpamNorTrashedTicketsFilter,
    useClosedTicketsTrend,
    useCustomerSatisfactionTrend,
    useFirstResponseTimeTrend,
    useMessagesPerTicketTrend,
    useResolutionTimeTrend,
    useTicketsCreatedTrend,
} from '../metricTrends'
import {MetricTrend} from '../useMetricTrend'

jest.mock(
    '../createUseMetricTrend',
    () =>
        (
            queryCreator: (
                filters: StatsFilters,
                timezone: string
            ) => MetricTrend
        ) =>
        (filters: StatsFilters, timezone: string) => {
            return queryCreator(filters, timezone)
        }
)

describe('metric trends', () => {
    describe.each([
        ['useCustomerSatisfactionTrend', useCustomerSatisfactionTrend],
        ['useFirstResponseTimeTrend', useFirstResponseTimeTrend],
        ['useMessagesPerTicketTrend', useMessagesPerTicketTrend],
        ['useResolutionTimeTrend', useResolutionTimeTrend],
        ['useClosedTicketsTrend', useClosedTicketsTrend],
        ['useTicketsCreatedTrend', useTicketsCreatedTrend],
    ])('%s', (testName, useTrendFn) => {
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

    describe('getTicketsRepliedQuery', () => {
        it('should build a query', () => {
            const query = getTicketsRepliedQueryFactory(statsFilters, timezone)

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
                        member: TicketMember.PeriodEnd,
                        operator: ReportingFilterOperator.BeforeDate,
                        values: [periodEnd],
                    },
                    {
                        member: TicketMember.FirstMessageChannel,
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

    describe('getMessagesSentQuery', () => {
        it('should create a query', () => {
            const query = getMessagesSentQueryFactory(statsFilters, timezone)

            expect(query).toEqual({
                measures: [HelpdeskMessageMeasure.MessageCount],
                dimensions: [],
                filters: [
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
})
