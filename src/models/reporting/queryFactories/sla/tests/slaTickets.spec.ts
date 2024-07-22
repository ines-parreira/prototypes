import moment from 'moment/moment'
import {TicketChannel} from 'business/types/ticket'
import {OrderDirection} from 'models/api/types'
import {
    TicketSLADimension,
    TicketSLAMeasure,
} from 'models/reporting/cubes/sla/TicketSLACube'
import {TicketMember} from 'models/reporting/cubes/TicketCube'
import {TicketMessagesMember} from 'models/reporting/cubes/TicketMessagesCube'
import {
    slaTicketsQueryFactory,
    slaTicketsTimeSeriesQueryFactory,
} from 'models/reporting/queryFactories/sla/slaTickets'
import {
    ReportingFilterOperator,
    ReportingGranularity,
} from 'models/reporting/types'
import {LegacyStatsFilters} from 'models/stat/types'
import {formatReportingQueryDate, getFilterDateRange} from 'utils/reporting'

describe('slaTickets', () => {
    const periodStart = moment()
    const periodEnd = periodStart.add(7, 'days')
    const tags = [1, 2]
    const statsFilters: LegacyStatsFilters = {
        period: {
            end_datetime: periodEnd.toISOString(),
            start_datetime: periodStart.toISOString(),
        },
        channels: [TicketChannel.Email, TicketChannel.Chat],
        integrations: [1],
        tags,
    }
    const timezone = 'someTimeZone'
    const sorting = OrderDirection.Asc
    const granularity = ReportingGranularity.Day

    describe('slaTicketsQueryFactory', () => {
        it('should produce the query', () => {
            const query = slaTicketsQueryFactory(statsFilters, timezone)

            expect(query).toEqual({
                measures: [TicketSLAMeasure.TicketCount],
                dimensions: [TicketSLADimension.SlaStatus],
                segments: [],
                filters: [
                    {
                        member: TicketMember.IsTrashed,
                        operator: ReportingFilterOperator.Equals,
                        values: ['0'],
                    },
                    {
                        member: TicketMember.IsSpam,
                        operator: ReportingFilterOperator.Equals,
                        values: ['0'],
                    },
                    {
                        member: TicketMember.PeriodStart,
                        operator: ReportingFilterOperator.AfterDate,
                        values: [formatReportingQueryDate(periodStart)],
                    },
                    {
                        member: TicketMember.PeriodEnd,
                        operator: ReportingFilterOperator.BeforeDate,
                        values: [formatReportingQueryDate(periodEnd)],
                    },
                    {
                        member: TicketMessagesMember.Integration,
                        operator: ReportingFilterOperator.Equals,
                        values: ['1'],
                    },
                    {
                        member: TicketMember.Channel,
                        operator: ReportingFilterOperator.Equals,
                        values: ['email', 'chat'],
                    },
                    {
                        member: TicketMember.Tags,
                        operator: ReportingFilterOperator.Equals,
                        values: tags.map(String),
                    },
                ],
                timezone,
            })
        })

        it('should produce the query with sorting', () => {
            const query = slaTicketsQueryFactory(
                statsFilters,
                timezone,
                sorting
            )

            expect(query).toEqual({
                ...slaTicketsQueryFactory(statsFilters, timezone),
                order: [[TicketSLAMeasure.TicketCount, sorting]],
            })
        })
    })

    describe('slaTicketsTimeSeriesQueryFactory', () => {
        it('should produce the query', () => {
            const query = slaTicketsTimeSeriesQueryFactory(
                statsFilters,
                timezone,
                granularity
            )

            expect(query).toEqual({
                ...slaTicketsQueryFactory(statsFilters, timezone),
                timeDimensions: [
                    {
                        dimension: TicketSLADimension.SlaAnchorDatetime,
                        granularity,
                        dateRange: getFilterDateRange(statsFilters.period),
                    },
                ],
                timezone,
            })
        })

        it('should produce the query with sorting', () => {
            const query = slaTicketsTimeSeriesQueryFactory(
                statsFilters,
                timezone,
                granularity,
                sorting
            )

            expect(query).toEqual({
                ...slaTicketsQueryFactory(statsFilters, timezone),
                timeDimensions: [
                    {
                        dimension: TicketSLADimension.SlaAnchorDatetime,
                        granularity,
                        dateRange: getFilterDateRange(statsFilters.period),
                    },
                ],
                order: [[TicketSLAMeasure.TicketCount, sorting]],
            })
        })
    })
})
