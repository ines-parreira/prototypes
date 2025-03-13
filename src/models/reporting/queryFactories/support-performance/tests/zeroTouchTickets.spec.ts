import moment from 'moment'

import { TicketChannel } from 'business/types/ticket'
import { OrderDirection } from 'models/api/types'
import {
    TicketDimension,
    TicketMeasure,
    TicketMember,
    TicketSegment,
} from 'models/reporting/cubes/TicketCube'
import {
    TicketMessagesDimension,
    TicketMessagesMember,
} from 'models/reporting/cubes/TicketMessagesCube'
import {
    zeroTouchTicketsPerAgentQueryFactory,
    zeroTouchTicketsPerTicketQueryFactory,
    zeroTouchTicketsQueryFactory,
    zeroTouchTicketsTimeSeriesQueryFactory,
} from 'models/reporting/queryFactories/support-performance/zeroTouchTickets'
import { withDefaultLogicalOperator } from 'models/reporting/queryFactories/utils'
import {
    ReportingFilterOperator,
    ReportingGranularity,
} from 'models/reporting/types'
import { StatsFilters, TagFilterInstanceId } from 'models/stat/types'
import { subtractDaysFromDate } from 'utils/date'
import {
    DRILLDOWN_QUERY_LIMIT,
    formatReportingQueryDate,
    getFilterDateRange,
    NotSpamNorTrashedTicketsFilter,
    TicketDrillDownFilter,
} from 'utils/reporting'

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
                zeroTouchTicketsPerTicketQueryFactory(statsFilters, timezone),
            ).toEqual({
                ...zeroTouchTicketsQueryFactory(statsFilters, timezone),
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
                zeroTouchTicketsPerTicketQueryFactory(
                    filters,
                    timezone,
                    sorting,
                ),
            ).toEqual({
                ...zeroTouchTicketsQueryFactory(filters, timezone, sorting),
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
