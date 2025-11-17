import moment from 'moment/moment'

import { QueryFiltersItemOperator } from '@gorgias/helpdesk-types'

import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import {
    TicketSLADimension,
    TicketSLAMeasure,
    TicketSLAMember,
    TicketSLASegment,
    TicketSLAStatus,
} from 'domains/reporting/models/cubes/sla/TicketSLACube'
import {
    TicketDimension,
    TicketMember,
} from 'domains/reporting/models/cubes/TicketCube'
import {
    breachedTicketsDrillDownQueryFactory,
    satisfiedOrBreachedTicketsDrillDownQueryFactory,
} from 'domains/reporting/models/queryFactories/sla/satisfiedOrBreachedTickets'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import {
    ReportingFilterOperator,
    ReportingGranularity,
} from 'domains/reporting/models/types'
import {
    DRILLDOWN_QUERY_LIMIT,
    formatReportingQueryDate,
    getFilterDateRange,
} from 'domains/reporting/utils/reporting'
import { OrderDirection } from 'models/api/types'

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
                timezone,
            )

            expect(query).toEqual({
                metricName:
                    METRIC_NAMES.SLA_SATISFIED_OR_BREACHED_TICKETS_PER_TICKET_DRILL_DOWN,
                limit: DRILLDOWN_QUERY_LIMIT,
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
                        dateRange: getFilterDateRange(statsFilters.period),
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
                sorting,
            )

            expect(query).toEqual({
                ...satisfiedOrBreachedTicketsDrillDownQueryFactory(
                    statsFilters,
                    timezone,
                ),
                order: [[TicketDimension.CreatedDatetime, sorting]],
            })
        })
    })

    describe('breachedTicketsDrillDownQueryFactory', () => {
        it('should produce the query', () => {
            const query = breachedTicketsDrillDownQueryFactory(
                statsFilters,
                timezone,
            )

            expect(query).toEqual({
                metricName:
                    METRIC_NAMES.SLA_BREACHED_TICKETS_PER_TICKET_DRILL_DOWN,
                limit: DRILLDOWN_QUERY_LIMIT,
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
                        dateRange: getFilterDateRange(statsFilters.period),
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
                sorting,
            )

            expect(query).toEqual({
                ...breachedTicketsDrillDownQueryFactory(statsFilters, timezone),
                order: [[TicketDimension.CreatedDatetime, sorting]],
            })
        })
    })
})
