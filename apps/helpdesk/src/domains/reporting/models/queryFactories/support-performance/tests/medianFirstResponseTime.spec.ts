import moment from 'moment'

import { TicketChannel } from 'business/types/ticket'
import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import {
    TicketDimension,
    TicketMember,
} from 'domains/reporting/models/cubes/TicketCube'
import { TicketFirstHumanAgentResponseTimeMember } from 'domains/reporting/models/cubes/TicketFirstHumanAgentResponseTime'
import {
    TicketMessagesDimension,
    TicketMessagesMeasure,
    TicketMessagesMember,
    TicketMessagesSegment,
} from 'domains/reporting/models/cubes/TicketMessagesCube'
import {
    firstResponseTimeMetricPerTicketDrillDownQueryFactory,
    medianFirstAgentResponseTimePerAgentQueryFactory,
    medianFirstAgentResponseTimePerChannelQueryFactory,
    medianFirstAgentResponseTimePerTicketDrillDownQueryFactory,
    medianFirstAgentResponseTimeQueryFactory,
    medianFirstResponseTimeMetricPerAgentQueryFactory,
    medianFirstResponseTimeQueryFactory,
} from 'domains/reporting/models/queryFactories/support-performance/medianFirstResponseTime'
import { withDefaultLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import {
    StatsFilters,
    TagFilterInstanceId,
} from 'domains/reporting/models/stat/types'
import { ReportingFilterOperator } from 'domains/reporting/models/types'
import {
    DRILLDOWN_QUERY_LIMIT,
    formatReportingQueryDate,
    NotSpamNorTrashedTicketsFilter,
    TicketDrillDownFilter,
} from 'domains/reporting/utils/reporting'
import { OrderDirection } from 'models/api/types'

describe('medianFirstResponseTimeMetricPerAgent', () => {
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
        stores: withDefaultLogicalOperator([1]),
        tags: [
            {
                ...withDefaultLogicalOperator([1, 2]),
                filterInstanceId: TagFilterInstanceId.First,
            },
        ],
    }
    const timezone = 'someTimeZone'
    const sorting = OrderDirection.Asc

    it('should build a query', () => {
        expect(
            medianFirstResponseTimeMetricPerAgentQueryFactory(
                statsFilters,
                timezone,
            ),
        ).toEqual({
            metricName:
                METRIC_NAMES.SUPPORT_PERFORMANCE_MEDIAN_FIRST_RESPONSE_TIME_PER_AGENT,
            dimensions: [TicketMessagesMember.FirstHelpdeskMessageUserId],
            filters: [
                ...NotSpamNorTrashedTicketsFilter,
                {
                    member: TicketMessagesMember.FirstHelpdeskMessageDatetime,
                    operator: ReportingFilterOperator.InDateRange,
                    values: [
                        formatReportingQueryDate(periodStart),
                        formatReportingQueryDate(periodEnd),
                    ],
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
                    member: TicketFirstHumanAgentResponseTimeMember.Integration,
                    operator: ReportingFilterOperator.Equals,
                    values: statsFilters.integrations?.values.map(String),
                },
                {
                    member: TicketFirstHumanAgentResponseTimeMember.Store,
                    operator: ReportingFilterOperator.Equals,
                    values: statsFilters.stores?.values.map(String),
                },
                {
                    member: TicketMember.Channel,
                    operator: ReportingFilterOperator.Equals,
                    values: statsFilters.channels?.values.map(String),
                },
                {
                    member: TicketMember.Tags,
                    operator: ReportingFilterOperator.Equals,
                    values: statsFilters.tags?.[0]?.values.map(String),
                },
            ],
            measures: [TicketMessagesMeasure.MedianFirstResponseTime],
            segments: [TicketMessagesSegment.ConversationStarted],
            timezone: timezone,
        })
    })

    it('should build a query with and agents sorting', () => {
        const agents = [2]

        expect(
            medianFirstResponseTimeMetricPerAgentQueryFactory(
                { ...statsFilters, agents: withDefaultLogicalOperator(agents) },
                timezone,
                sorting,
            ),
        ).toEqual({
            metricName:
                METRIC_NAMES.SUPPORT_PERFORMANCE_MEDIAN_FIRST_RESPONSE_TIME_PER_AGENT,
            dimensions: [TicketMessagesMember.FirstHelpdeskMessageUserId],
            filters: [
                ...NotSpamNorTrashedTicketsFilter,
                {
                    member: TicketMessagesMember.FirstHelpdeskMessageDatetime,
                    operator: ReportingFilterOperator.InDateRange,
                    values: [
                        formatReportingQueryDate(periodStart),
                        formatReportingQueryDate(periodEnd),
                    ],
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
                    member: TicketFirstHumanAgentResponseTimeMember.Integration,
                    operator: ReportingFilterOperator.Equals,
                    values: statsFilters.integrations?.values.map(String),
                },
                {
                    member: TicketFirstHumanAgentResponseTimeMember.Store,
                    operator: ReportingFilterOperator.Equals,
                    values: statsFilters.stores?.values.map(String),
                },
                {
                    member: TicketMember.Channel,
                    operator: ReportingFilterOperator.Equals,
                    values: statsFilters.channels?.values,
                },
                {
                    member: TicketMessagesMember.FirstHelpdeskMessageUserId,
                    operator: ReportingFilterOperator.Equals,
                    values: agents?.map(String),
                },
                {
                    member: TicketMember.Tags,
                    operator: ReportingFilterOperator.Equals,
                    values: statsFilters.tags?.[0]?.values.map(String),
                },
            ],
            measures: [TicketMessagesMeasure.MedianFirstResponseTime],
            order: [[TicketMessagesMeasure.MedianFirstResponseTime, sorting]],
            segments: [TicketMessagesSegment.ConversationStarted],
            timezone: timezone,
        })
    })
})

describe('firstResponseTimeMetricPerTicketQueryFactory', () => {
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

    it('should build a query', () => {
        expect(
            firstResponseTimeMetricPerTicketDrillDownQueryFactory(
                statsFilters,
                timezone,
            ),
        ).toEqual({
            ...medianFirstResponseTimeQueryFactory(statsFilters, timezone),
            metricName:
                METRIC_NAMES.SUPPORT_PERFORMANCE_MEDIAN_FIRST_RESPONSE_TIME_PER_TICKET_DRILL_DOWN,
            measures: [],
            dimensions: [
                TicketDimension.TicketId,
                TicketMessagesDimension.FirstResponseTime,
                ...medianFirstResponseTimeMetricPerAgentQueryFactory(
                    statsFilters,
                    timezone,
                ).dimensions,
            ],
            filters: [
                ...medianFirstResponseTimeMetricPerAgentQueryFactory(
                    statsFilters,
                    timezone,
                ).filters,
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
            firstResponseTimeMetricPerTicketDrillDownQueryFactory(
                filters,
                timezone,
                sorting,
            ),
        ).toEqual({
            ...medianFirstResponseTimeMetricPerAgentQueryFactory(
                filters,
                timezone,
            ),
            metricName:
                METRIC_NAMES.SUPPORT_PERFORMANCE_MEDIAN_FIRST_RESPONSE_TIME_PER_TICKET_DRILL_DOWN,
            measures: [],
            dimensions: [
                TicketDimension.TicketId,
                TicketMessagesDimension.FirstResponseTime,
                ...medianFirstResponseTimeMetricPerAgentQueryFactory(
                    statsFilters,
                    timezone,
                ).dimensions,
            ],
            filters: [
                ...medianFirstResponseTimeMetricPerAgentQueryFactory(
                    filters,
                    timezone,
                ).filters,
                TicketDrillDownFilter,
            ],
            limit: DRILLDOWN_QUERY_LIMIT,
            order: [[TicketMessagesDimension.FirstResponseTime, sorting]],
        })
    })
})

describe('medianFirstAgentResponseTime', () => {
    const timezone = 'utc'
    const sorting = OrderDirection.Asc
    const periodStart = '2025-09-09T00:00:00'
    const periodEnd = '2025-09-09T23:59:59'
    const statsFilters: StatsFilters = {
        period: {
            end_datetime: periodEnd,
            start_datetime: periodStart,
        },
    }

    describe('medianFirstAgentResponseTimeQueryFactory', () => {
        const baseQuery = {
            metricName: 'support-performance-median-first-agent-response-time',
            measures: [
                'TicketFirstAgentResponseTime.medianFirstAgentResponseTime',
            ],
            dimensions: [],
            timezone: 'utc',
            filters: [
                {
                    member: 'TicketEnriched.isTrashed',
                    operator: 'equals',
                    values: ['0'],
                },
                {
                    member: 'TicketEnriched.isSpam',
                    operator: 'equals',
                    values: ['0'],
                },
                {
                    member: 'TicketFirstAgentResponseTime.firstAgentMessageDatetime',
                    operator: 'inDateRange',
                    values: [
                        '2025-09-09T00:00:00.000',
                        '2025-09-09T23:59:59.000',
                    ],
                },
                {
                    member: 'TicketEnriched.periodStart',
                    operator: 'afterDate',
                    values: ['2025-09-09T00:00:00.000'],
                },
                {
                    member: 'TicketEnriched.periodEnd',
                    operator: 'beforeDate',
                    values: ['2025-09-09T23:59:59.000'],
                },
            ],
        }

        it('builds query', () => {
            const actual = medianFirstAgentResponseTimeQueryFactory(
                statsFilters,
                timezone,
            )

            const expected = { ...baseQuery }

            expect(actual).toEqual(expected)
        })

        it('builds query with sorting', () => {
            const actual = medianFirstAgentResponseTimeQueryFactory(
                statsFilters,
                timezone,
                sorting,
            )

            const expected = {
                ...baseQuery,
                order: [
                    [
                        'TicketFirstAgentResponseTime.medianFirstAgentResponseTime',
                        'asc',
                    ],
                ],
            }

            expect(actual).toEqual(expected)
        })
    })

    describe('medianFirstAgentResponseTimePerAgentQueryFactory', () => {
        const baseQuery = {
            metricName:
                'support-performance-median-first-agent-response-time-per-agent',
            measures: [
                'TicketFirstAgentResponseTime.medianFirstAgentResponseTime',
            ],
            dimensions: [
                'TicketFirstAgentResponseTime.firstAgentMessageUserId',
            ],
            timezone: 'utc',
            filters: [
                {
                    member: 'TicketEnriched.isTrashed',
                    operator: 'equals',
                    values: ['0'],
                },
                {
                    member: 'TicketEnriched.isSpam',
                    operator: 'equals',
                    values: ['0'],
                },
                {
                    member: 'TicketFirstAgentResponseTime.firstAgentMessageDatetime',
                    operator: 'inDateRange',
                    values: [
                        '2025-09-09T00:00:00.000',
                        '2025-09-09T23:59:59.000',
                    ],
                },
                {
                    member: 'TicketEnriched.periodStart',
                    operator: 'afterDate',
                    values: ['2025-09-09T00:00:00.000'],
                },
                {
                    member: 'TicketEnriched.periodEnd',
                    operator: 'beforeDate',
                    values: ['2025-09-09T23:59:59.000'],
                },
            ],
        }

        it('builds query', () => {
            const actual = medianFirstAgentResponseTimePerAgentQueryFactory(
                statsFilters,
                timezone,
            )

            const expected = { ...baseQuery }

            expect(actual).toEqual(expected)
        })

        it('builds query with sorting', () => {
            const actual = medianFirstAgentResponseTimePerAgentQueryFactory(
                statsFilters,
                timezone,
                sorting,
            )

            const expected = {
                ...baseQuery,
                order: [
                    [
                        'TicketFirstAgentResponseTime.medianFirstAgentResponseTime',
                        'asc',
                    ],
                ],
            }

            expect(actual).toEqual(expected)
        })
    })

    describe('medianFirstAgentResponseTimePerChannelQueryFactory', () => {
        const baseQuery = {
            metricName:
                'support-performance-median-first-agent-response-time-per-channel',
            measures: [
                'TicketFirstAgentResponseTime.medianFirstAgentResponseTime',
            ],
            dimensions: ['TicketEnriched.channel'],
            timezone: 'utc',
            filters: [
                {
                    member: 'TicketEnriched.isTrashed',
                    operator: 'equals',
                    values: ['0'],
                },
                {
                    member: 'TicketEnriched.isSpam',
                    operator: 'equals',
                    values: ['0'],
                },
                {
                    member: 'TicketFirstAgentResponseTime.firstAgentMessageDatetime',
                    operator: 'inDateRange',
                    values: [
                        '2025-09-09T00:00:00.000',
                        '2025-09-09T23:59:59.000',
                    ],
                },
                {
                    member: 'TicketEnriched.periodStart',
                    operator: 'afterDate',
                    values: ['2025-09-09T00:00:00.000'],
                },
                {
                    member: 'TicketEnriched.periodEnd',
                    operator: 'beforeDate',
                    values: ['2025-09-09T23:59:59.000'],
                },
            ],
        }

        it('builds query', () => {
            const actual = medianFirstAgentResponseTimePerChannelQueryFactory(
                statsFilters,
                timezone,
            )

            const expected = { ...baseQuery }

            expect(actual).toEqual(expected)
        })

        it('builds query with sorting', () => {
            const actual = medianFirstAgentResponseTimePerChannelQueryFactory(
                statsFilters,
                timezone,
                sorting,
            )

            const expected = {
                ...baseQuery,
                order: [
                    [
                        'TicketFirstAgentResponseTime.medianFirstAgentResponseTime',
                        'asc',
                    ],
                ],
            }

            expect(actual).toEqual(expected)
        })
    })

    describe('medianFirstAgentResponseTimePerTicketDrillDownQueryFactory', () => {
        const baseQuery = {
            metricName:
                'support-performance-median-first-agent-response-time-per-ticket-drill-down',
            measures: [],
            dimensions: [
                'TicketEnriched.ticketId',
                'TicketFirstAgentResponseTime.firstAgentResponseTime',
                'TicketFirstAgentResponseTime.firstAgentMessageUserId',
            ],
            timezone: 'utc',
            filters: [
                {
                    member: 'TicketEnriched.isTrashed',
                    operator: 'equals',
                    values: ['0'],
                },
                {
                    member: 'TicketEnriched.isSpam',
                    operator: 'equals',
                    values: ['0'],
                },
                {
                    member: 'TicketFirstAgentResponseTime.firstAgentMessageDatetime',
                    operator: 'inDateRange',
                    values: [
                        '2025-09-09T00:00:00.000',
                        '2025-09-09T23:59:59.000',
                    ],
                },
                {
                    member: 'TicketEnriched.periodStart',
                    operator: 'afterDate',
                    values: ['2025-09-09T00:00:00.000'],
                },
                {
                    member: 'TicketEnriched.periodEnd',
                    operator: 'beforeDate',
                    values: ['2025-09-09T23:59:59.000'],
                },
                {
                    member: 'TicketEnriched.ticketCount',
                    operator: 'measureFilter',
                    values: [],
                },
            ],
            limit: 100,
        }

        it('builds query', () => {
            const actual =
                medianFirstAgentResponseTimePerTicketDrillDownQueryFactory(
                    statsFilters,
                    timezone,
                )

            const expected = { ...baseQuery }

            expect(actual).toEqual(expected)
        })

        it('builds query with sorting', () => {
            const actual =
                medianFirstAgentResponseTimePerTicketDrillDownQueryFactory(
                    statsFilters,
                    timezone,
                    sorting,
                )

            const expected = {
                ...baseQuery,
                order: [
                    [
                        'TicketFirstAgentResponseTime.firstAgentResponseTime',
                        'asc',
                    ],
                ],
            }

            expect(actual).toEqual(expected)
        })
    })
})
