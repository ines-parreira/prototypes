import {QueryFiltersItemOperator} from '@gorgias/api-types'
import moment from 'moment/moment'
import {
    ReportingFilterOperator,
    ReportingGranularity,
} from 'models/reporting/types'
import {TicketDimension, TicketMember} from 'models/reporting/cubes/TicketCube'
import {
    breachedTicketsDrillDownQueryFactory,
    satisfiedOrBreachedTicketsDrillDownQueryFactory,
} from 'models/reporting/queryFactories/sla/satisfiedOrBreachedTickets'
import {
    TicketSLADimension,
    TicketSLAMeasure,
    TicketSLAMember,
    TicketSLASegment,
    TicketSLAStatus,
} from 'models/reporting/cubes/sla/TicketSLACube'
import {OrderDirection} from 'models/api/types'
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

    describe('satisfiedOrBreachedTicketsDrillDownQueryFactory', () => {
        it('should produce the query', () => {
            const query = satisfiedOrBreachedTicketsDrillDownQueryFactory(
                statsFilters,
                timezone
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
                    {
                        member: TicketSLADimension.SlaStatus,
                        operator: ReportingFilterOperator.Equals,
                        values: [
                            TicketSLAStatus.Satisfied,
                            TicketSLAStatus.Breached,
                        ],
                    },
                ],
                segments: [
                    TicketSLASegment.TicketsWithSlaAnchorDatetimeDuringSelectedPeriod,
                ],
                dimensions: [
                    TicketDimension.TicketId,
                    TicketSLADimension.TicketId,
                    TicketSLADimension.SlaStatus,
                    TicketSLADimension.SlaPolicyMetricName,
                    TicketSLADimension.SlaPolicyMetricStatus,
                    TicketSLADimension.SlaDelta,
                ],
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
            const query = satisfiedOrBreachedTicketsDrillDownQueryFactory(
                statsFilters,
                timezone,
                sorting
            )

            expect(query).toEqual({
                ...satisfiedOrBreachedTicketsDrillDownQueryFactory(
                    statsFilters,
                    timezone
                ),
                order: [[TicketDimension.CreatedDatetime, sorting]],
            })
        })
    })

    describe('breachedTicketsDrillDownQueryFactory', () => {
        it('should produce the query', () => {
            const query = breachedTicketsDrillDownQueryFactory(
                statsFilters,
                timezone
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
                    {
                        member: TicketSLADimension.SlaStatus,
                        operator: ReportingFilterOperator.Equals,
                        values: [TicketSLAStatus.Breached],
                    },
                ],
                segments: [
                    TicketSLASegment.TicketsWithSlaAnchorDatetimeDuringSelectedPeriod,
                ],
                dimensions: [
                    TicketDimension.TicketId,
                    TicketSLADimension.TicketId,
                    TicketSLADimension.SlaStatus,
                    TicketSLADimension.SlaPolicyMetricName,
                    TicketSLADimension.SlaPolicyMetricStatus,
                    TicketSLADimension.SlaDelta,
                ],
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
            const query = breachedTicketsDrillDownQueryFactory(
                statsFilters,
                timezone,
                sorting
            )

            expect(query).toEqual({
                ...breachedTicketsDrillDownQueryFactory(statsFilters, timezone),
                order: [[TicketDimension.CreatedDatetime, sorting]],
            })
        })
    })
})
