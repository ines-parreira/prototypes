import moment from 'moment/moment'

import {
    TicketDimension,
    TicketMeasure,
    TicketMember,
} from 'domains/reporting/models/cubes/TicketCube'
import {
    openTicketsPerTicketDrillDownQueryFactory,
    openTicketsQueryFactory,
} from 'domains/reporting/models/queryFactories/support-performance/openTickets'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import { ReportingFilterOperator } from 'domains/reporting/models/types'
import {
    DRILLDOWN_QUERY_LIMIT,
    formatReportingQueryDate,
    NotSpamNorTrashedTicketsFilter,
    TicketDrillDownFilter,
} from 'domains/reporting/utils/reporting'
import { OrderDirection } from 'models/api/types'
import { subtractDaysFromDate } from 'utils/date'

describe('openTicketsTrendQueryFactory', () => {
    const now = moment()
    const periodStart = formatReportingQueryDate(now)
    const hardPeriodStart = formatReportingQueryDate(
        subtractDaysFromDate(formatReportingQueryDate(now), 180),
    )
    const periodEnd = formatReportingQueryDate(moment())
    const statsFilters: StatsFilters = {
        period: {
            end_datetime: periodEnd,
            start_datetime: periodStart,
        },
    }
    const timezone = 'someTimeZone'

    it('should build a query', () => {
        const query = openTicketsQueryFactory(statsFilters, timezone)

        expect(query).toEqual({
            measures: [TicketMeasure.TicketCount],
            dimensions: [],
            filters: [
                ...NotSpamNorTrashedTicketsFilter,
                {
                    member: TicketMember.Status,
                    operator: ReportingFilterOperator.Equals,
                    values: ['open'],
                },
                {
                    member: TicketMember.PeriodStart,
                    operator: ReportingFilterOperator.AfterDate,
                    values: [hardPeriodStart],
                },
                {
                    member: TicketMember.PeriodEnd,
                    operator: ReportingFilterOperator.BeforeDate,
                    values: [periodEnd],
                },
                {
                    member: TicketMember.CreatedDatetime,
                    operator: ReportingFilterOperator.AfterDate,
                    values: [hardPeriodStart],
                },
            ],
            timezone,
        })
    })
})

describe('openTicketsPerTicketQueryFactory', () => {
    const periodStart = formatReportingQueryDate(moment())
    const periodEnd = formatReportingQueryDate(moment())
    const statsFilters: StatsFilters = {
        period: {
            end_datetime: periodEnd,
            start_datetime: periodStart,
        },
    }
    const timezone = 'someTimeZone'
    const sorting = OrderDirection.Asc

    it('should build a query', () => {
        const query = openTicketsPerTicketDrillDownQueryFactory(
            statsFilters,
            timezone,
        )

        expect(query).toEqual({
            ...openTicketsQueryFactory(statsFilters, timezone),
            measures: [],
            dimensions: [
                TicketDimension.TicketId,
                TicketDimension.CreatedDatetime,
            ],
            filters: [
                ...openTicketsQueryFactory(statsFilters, timezone).filters,
                TicketDrillDownFilter,
            ],
            limit: DRILLDOWN_QUERY_LIMIT,
        })
    })

    it('should build a query with sorting', () => {
        const query = openTicketsPerTicketDrillDownQueryFactory(
            statsFilters,
            timezone,
            sorting,
        )

        expect(query).toEqual({
            ...openTicketsQueryFactory(statsFilters, timezone),
            measures: [],
            dimensions: [
                TicketDimension.TicketId,
                TicketDimension.CreatedDatetime,
            ],
            filters: [
                ...openTicketsQueryFactory(statsFilters, timezone).filters,
                TicketDrillDownFilter,
            ],
            limit: DRILLDOWN_QUERY_LIMIT,
            order: [[TicketDimension.CreatedDatetime, sorting]],
        })
    })
})
