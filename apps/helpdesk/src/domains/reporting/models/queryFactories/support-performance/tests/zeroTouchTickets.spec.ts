import moment from 'moment'

import { TicketChannel } from 'business/types/ticket'
import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import {
    TicketDimension,
    TicketMeasure,
    TicketMember,
    TicketSegment,
} from 'domains/reporting/models/cubes/TicketCube'
import {
    TicketMessagesDimension,
    TicketMessagesMember,
} from 'domains/reporting/models/cubes/TicketMessagesCube'
import {
    zeroTouchTicketsPerAgentQueryFactory,
    zeroTouchTicketsPerTicketDrillDownQueryFactory,
    zeroTouchTicketsQueryFactory,
    zeroTouchTicketsTimeSeriesQueryFactory,
} from 'domains/reporting/models/queryFactories/support-performance/zeroTouchTickets'
import { withDefaultLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import {
    StatsFilters,
    TagFilterInstanceId,
} from 'domains/reporting/models/stat/types'
import {
    ReportingFilterOperator,
    ReportingGranularity,
} from 'domains/reporting/models/types'
import {
    DRILLDOWN_QUERY_LIMIT,
    formatReportingQueryDate,
    getFilterDateRange,
    NotSpamNorTrashedTicketsFilter,
    TicketDrillDownFilter,
} from 'domains/reporting/utils/reporting'
import { OrderDirection } from 'models/api/types'
import { subtractDaysFromDate } from 'utils/date'

describe('zeroTouchTickets', () => {
    const periodStart = moment()
    const periodEnd = periodStart.add(7, 'days')
    const statsFilters: StatsFilters = {
        period: {
            end_datetime: periodEnd.toISOString(),
            start_datetime: periodStart.toISOString(),
        },
        channels: withDefaultLogicalOperator([
            TicketChannel.Email,
            TicketChannel.Chat,
        ]),
        integrations: withDefaultLogicalOperator([1]),
        tags: [
            {
                ...withDefaultLogicalOperator([1, 2]),
                filterInstanceId: TagFilterInstanceId.First,
            },
        ],
    }
    const timezone = 'someTimeZone'
    const sorting = OrderDirection.Asc

    describe('zeroTouchTicketsPerAgentQueryFactory', () => {
        it('should build a query', () => {
            expect(
                zeroTouchTicketsPerAgentQueryFactory(statsFilters, timezone),
            ).toEqual({
                metricName: METRIC_NAMES.SUPPORT_PERFORMANCE_ZERO_TOUCH_TICKETS,
                dimensions: [TicketDimension.AssigneeUserId],
                filters: [
                    ...NotSpamNorTrashedTicketsFilter,
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
                        values: statsFilters.integrations?.values.map(String),
                    },
                    {
                        member: TicketMember.Channel,
                        operator: ReportingFilterOperator.Equals,
                        values: statsFilters.channels?.values,
                    },
                    {
                        member: TicketMember.Tags,
                        operator: ReportingFilterOperator.Equals,
                        values: statsFilters.tags?.[0]?.values.map(String),
                    },
                    {
                        member: TicketDimension.CreatedDatetime,
                        operator: ReportingFilterOperator.AfterDate,
                        values: [
                            formatReportingQueryDate(
                                subtractDaysFromDate(
                                    statsFilters.period.start_datetime,
                                    180,
                                ),
                            ),
                        ],
                    },
                    {
                        member: TicketMessagesMember.PeriodStart,
                        operator: ReportingFilterOperator.AfterDate,
                        values: [
                            formatReportingQueryDate(
                                subtractDaysFromDate(
                                    statsFilters.period.start_datetime,
                                    180,
                                ),
                            ),
                        ],
                    },
                ],
                measures: [TicketMeasure.TicketCount],
                segments: [
                    TicketMessagesDimension.ZeroTouchTickets,
                    TicketSegment.ClosedTickets,
                ],
                timeDimensions: [],
                timezone: timezone,
            })
        })

        it('should build a query with sorting', () => {
            const agents = withDefaultLogicalOperator([2])

            expect(
                zeroTouchTicketsPerAgentQueryFactory(
                    { ...statsFilters, agents },
                    timezone,
                    sorting,
                ),
            ).toEqual({
                metricName: METRIC_NAMES.SUPPORT_PERFORMANCE_ZERO_TOUCH_TICKETS,
                dimensions: [TicketDimension.AssigneeUserId],
                filters: [
                    ...NotSpamNorTrashedTicketsFilter,
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
                        values: statsFilters.integrations?.values.map(String),
                    },
                    {
                        member: TicketMember.Channel,
                        operator: ReportingFilterOperator.Equals,
                        values: statsFilters.channels?.values,
                    },
                    {
                        member: TicketMember.AssigneeUserId,
                        operator: ReportingFilterOperator.Equals,
                        values: agents?.values.map(String),
                    },
                    {
                        member: TicketMember.Tags,
                        operator: ReportingFilterOperator.Equals,
                        values: statsFilters.tags?.[0]?.values.map(String),
                    },
                    {
                        member: TicketDimension.CreatedDatetime,
                        operator: ReportingFilterOperator.AfterDate,
                        values: [
                            formatReportingQueryDate(
                                subtractDaysFromDate(
                                    statsFilters.period.start_datetime,
                                    180,
                                ),
                            ),
                        ],
                    },
                    {
                        member: TicketMessagesMember.PeriodStart,
                        operator: ReportingFilterOperator.AfterDate,
                        values: [
                            formatReportingQueryDate(
                                subtractDaysFromDate(
                                    statsFilters.period.start_datetime,
                                    180,
                                ),
                            ),
                        ],
                    },
                ],
                measures: [TicketMeasure.TicketCount],
                order: [[TicketMeasure.TicketCount, sorting]],
                segments: [
                    TicketMessagesDimension.ZeroTouchTickets,
                    TicketSegment.ClosedTickets,
                ],
                timeDimensions: [],
                timezone: timezone,
            })
        })
    })

    describe('zeroTouchTicketsPerTicketQueryFactory', () => {
        it('should build a query', () => {
            expect(
                zeroTouchTicketsPerTicketDrillDownQueryFactory(
                    statsFilters,
                    timezone,
                ),
            ).toEqual({
                ...zeroTouchTicketsQueryFactory(statsFilters, timezone),
                metricName:
                    METRIC_NAMES.SUPPORT_PERFORMANCE_ZERO_TOUCH_TICKETS_PER_TICKET_DRILL_DOWN,
                measures: [],
                dimensions: [
                    TicketDimension.TicketId,
                    TicketDimension.CreatedDatetime,
                ],
                filters: [
                    ...zeroTouchTicketsQueryFactory(statsFilters, timezone)
                        .filters,
                    TicketDrillDownFilter,
                ],
                limit: DRILLDOWN_QUERY_LIMIT,
            })
        })

        it('should build a query with agents filter and sorting', () => {
            const agents = withDefaultLogicalOperator([2])
            const filters = { ...statsFilters, agents }

            expect(
                zeroTouchTicketsPerTicketDrillDownQueryFactory(
                    filters,
                    timezone,
                    sorting,
                ),
            ).toEqual({
                ...zeroTouchTicketsQueryFactory(filters, timezone, sorting),
                metricName:
                    METRIC_NAMES.SUPPORT_PERFORMANCE_ZERO_TOUCH_TICKETS_PER_TICKET_DRILL_DOWN,
                measures: [],
                dimensions: [
                    TicketDimension.TicketId,
                    TicketDimension.CreatedDatetime,
                ],
                filters: [
                    ...zeroTouchTicketsQueryFactory(filters, timezone).filters,
                    TicketDrillDownFilter,
                ],
                limit: DRILLDOWN_QUERY_LIMIT,
                order: [[TicketDimension.CreatedDatetime, sorting]],
            })
        })
    })
})

describe('zeroTouchTicketsTimeSeriesQueryFactory', () => {
    const periodStart = formatReportingQueryDate(moment())
    const periodEnd = formatReportingQueryDate(moment())
    const statsFilters: StatsFilters = {
        period: {
            end_datetime: periodEnd,
            start_datetime: periodStart,
        },
    }
    const granularity = ReportingGranularity.Day
    const timezone = 'someTimeZone'

    it('should create a query', () => {
        const query = zeroTouchTicketsTimeSeriesQueryFactory(
            statsFilters,
            timezone,
            granularity,
        )

        expect(query).toEqual({
            ...zeroTouchTicketsQueryFactory(statsFilters, timezone),
            metricName:
                METRIC_NAMES.SUPPORT_PERFORMANCE_ZERO_TOUCH_TICKETS_TIME_SERIES,
            timeDimensions: [
                {
                    dateRange: getFilterDateRange(statsFilters.period),
                    dimension: TicketDimension.ClosedDatetime,
                    granularity: granularity,
                },
            ],
        })
    })
})
