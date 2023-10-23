import moment from 'moment/moment'
import {TicketMeasure, TicketMember} from 'models/reporting/cubes/TicketCube'
import {openTicketsQueryFactory} from 'models/reporting/queryFactories/support-performance/openTickets'
import {ReportingFilterOperator} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'
import {
    formatReportingQueryDate,
    NotSpamNorTrashedTicketsFilter,
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
