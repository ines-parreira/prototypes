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
    oneTouchTicketsPerAgentQueryFactory,
    oneTouchTicketsPerTicketDrillDownQueryFactory,
    oneTouchTicketsQueryFactory,
    oneTouchTicketsTimeSeriesQueryFactory,
} from 'domains/reporting/models/queryFactories/support-performance/oneTouchTickets'
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

describe('OneTouchTickets', () => {
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

    describe('oneTouchTicketsPerAgentQueryFactory', () => {
        it('should build a query', () => {
            expect(
                oneTouchTicketsPerAgentQueryFactory(statsFilters, timezone),
            ).toEqual({
                metricName: METRIC_NAMES.SUPPORT_PERFORMANCE_ONE_TOUCH_TICKETS,
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
                    TicketMessagesDimension.OneTouchTickets,
                    TicketSegment.ClosedTickets,
                ],
                timeDimensions: [],
                timezone: timezone,
            })
        })

        it('should build a query with sorting', () => {
            const agents = [2]

            expect(
                oneTouchTicketsPerAgentQueryFactory(
                    {
                        ...statsFilters,
                        agents: withDefaultLogicalOperator(agents),
                    },
                    timezone,
                    sorting,
                ),
            ).toEqual({
                metricName: METRIC_NAMES.SUPPORT_PERFORMANCE_ONE_TOUCH_TICKETS,
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
                        values: agents?.map(String),
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
                    TicketMessagesDimension.OneTouchTickets,
                    TicketSegment.ClosedTickets,
                ],
                timeDimensions: [],
                timezone: timezone,
            })
        })
    })

    describe('oneTouchTicketsPerTicketQueryFactory', () => {
        it('should build a query', () => {
            expect(
                oneTouchTicketsPerTicketDrillDownQueryFactory(
                    statsFilters,
                    timezone,
                ),
            ).toEqual({
                ...oneTouchTicketsQueryFactory(statsFilters, timezone),
                metricName:
                    METRIC_NAMES.SUPPORT_PERFORMANCE_ONE_TOUCH_TICKETS_PER_TICKET_DRILL_DOWN,
                measures: [],
                dimensions: [
                    TicketDimension.TicketId,
                    TicketDimension.CreatedDatetime,
                ],
                filters: [
                    ...oneTouchTicketsQueryFactory(statsFilters, timezone)
                        .filters,
                    TicketDrillDownFilter,
                ],
                limit: DRILLDOWN_QUERY_LIMIT,
            })
        })

        it('should build a query with agents filter and sorting', () => {
            const agents = [2]
            const filters = {
                ...statsFilters,
                agents: withDefaultLogicalOperator(agents),
            }

            expect(
                oneTouchTicketsPerTicketDrillDownQueryFactory(
                    filters,
                    timezone,
                    sorting,
                ),
            ).toEqual({
                ...oneTouchTicketsQueryFactory(filters, timezone, sorting),
                metricName:
                    METRIC_NAMES.SUPPORT_PERFORMANCE_ONE_TOUCH_TICKETS_PER_TICKET_DRILL_DOWN,
                measures: [],
                dimensions: [
                    TicketDimension.TicketId,
                    TicketDimension.CreatedDatetime,
                ],
                filters: [
                    ...oneTouchTicketsQueryFactory(filters, timezone).filters,
                    TicketDrillDownFilter,
                ],
                limit: DRILLDOWN_QUERY_LIMIT,
                order: [[TicketDimension.CreatedDatetime, sorting]],
            })
        })
    })
})

describe('oneTouchTicketsTimeSeriesQueryFactory', () => {
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
        const query = oneTouchTicketsTimeSeriesQueryFactory(
            statsFilters,
            timezone,
            granularity,
        )

        expect(query).toEqual({
            ...oneTouchTicketsQueryFactory(statsFilters, timezone),
            metricName:
                METRIC_NAMES.SUPPORT_PERFORMANCE_ONE_TOUCH_TICKETS_TIME_SERIES,
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
