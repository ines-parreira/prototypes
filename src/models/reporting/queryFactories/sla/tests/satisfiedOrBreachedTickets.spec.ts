import {QueryFiltersItemOperator} from '@gorgias/api-types'
import moment from 'moment/moment'
import {ReportingGranularity} from 'models/reporting/types'
import {TicketMember} from 'models/reporting/cubes/TicketCube'
import {satisfiedOrBreachedTicketsDrillDownQueryFactory} from 'models/reporting/queryFactories/sla/satisfiedOrBreachedTickets'
import {
    TicketSLADimension,
    TicketSLAMeasure,
    TicketSLAMember,
    TicketSLASegment,
} from 'models/reporting/cubes/sla/TicketSLACube'
import {OrderDirection} from 'models/api/types'
import {slaTicketsQueryFactory} from 'models/reporting/queryFactories/sla/slaTickets'
import {StatsFilters} from 'models/stat/types'
import {formatReportingQueryDate, getFilterDateRange} from 'utils/reporting'

describe('satisfiedOrBreachedTicketsTicketsQueryFactory', () => {
    const periodStart = moment()
    const periodEnd = periodStart.add(7, 'days')
    const statsFilters: StatsFilters = {
        period: {
            end_datetime: periodEnd.toISOString(),
            start_datetime: periodStart.toISOString(),
        },
    }
    const timezone = 'someTimeZone'
    const sorting = OrderDirection.Desc

    describe('satisfiedOrBreachedTicketsTicketsQueryFactory', () => {
        it('should produce the query', () => {
            const query = satisfiedOrBreachedTicketsDrillDownQueryFactory(
                statsFilters,
                timezone,
                sorting
            )

            expect(query).toEqual({
                measures: [TicketSLAMeasure.TicketCount],
                filters: [
                    {
                        member: TicketMember.IsTrashed,
                        operator: QueryFiltersItemOperator.Equals,
                        values: ['0'],
                    },
                    {
                        member: TicketMember.IsSpam,
                        operator: QueryFiltersItemOperator.Equals,
                        values: ['0'],
                    },
                    {
                        member: TicketMember.PeriodStart,
                        operator: QueryFiltersItemOperator.AfterDate,
                        values: [formatReportingQueryDate(periodStart)],
                    },
                    {
                        member: TicketMember.PeriodEnd,
                        operator: QueryFiltersItemOperator.BeforeDate,
                        values: [formatReportingQueryDate(periodEnd)],
                    },
                ],
                segments: [TicketSLASegment.SatisfiedOrBreachedTickets],
                dimensions: [
                    TicketSLADimension.TicketId,
                    TicketSLADimension.SlaStatus,
                    TicketSLADimension.SlaPolicyMetricName,
                    TicketSLADimension.SlaPolicyMetricStatus,
                    TicketSLADimension.SlaDelta,
                ],
                order: [[TicketSLAMeasure.TicketCount, OrderDirection.Desc]],
                timeDimensions: [
                    {
                        dateRange: getFilterDateRange(statsFilters),
                        dimension: TicketSLAMember.SlaAnchorDatetime,
                        granularity: ReportingGranularity.Day,
                    },
                ],
                timezone: timezone,
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
})
