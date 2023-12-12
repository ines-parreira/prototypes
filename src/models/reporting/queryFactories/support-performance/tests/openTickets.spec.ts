import moment from 'moment/moment'
import {OrderDirection} from 'models/api/types'
import {
    TicketDimension,
    TicketMeasure,
    TicketMember,
} from 'models/reporting/cubes/TicketCube'
import {
    openTicketsPerTicketQueryFactory,
    openTicketsQueryFactory,
} from 'models/reporting/queryFactories/support-performance/openTickets'
import {ReportingFilterOperator} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'
import {
    DRILLDOWN_QUERY_LIMIT,
    formatReportingQueryDate,
    NotSpamNorTrashedTicketsFilter,
    TicketDrillDownFilter,
} from 'utils/reporting'

describe('openTicketsTrendQueryFactory', () => {
    const periodStart = formatReportingQueryDate(moment())
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
                    member: TicketMember.PeriodEnd,
                    operator: ReportingFilterOperator.BeforeDate,
                    values: [periodEnd],
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
        const query = openTicketsPerTicketQueryFactory(statsFilters, timezone)

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
        const query = openTicketsPerTicketQueryFactory(
            statsFilters,
            timezone,
            sorting
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
