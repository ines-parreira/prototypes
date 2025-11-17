import moment from 'moment'

import { TicketChannel } from 'business/types/ticket'
import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import type { HelpdeskMessageCubeWithJoins } from 'domains/reporting/models/cubes/HelpdeskMessageCube'
import {
    HelpdeskMessageDimension,
    HelpdeskMessageMeasure,
    HelpdeskMessageMember,
} from 'domains/reporting/models/cubes/HelpdeskMessageCube'
import {
    TicketDimension,
    TicketMember,
} from 'domains/reporting/models/cubes/TicketCube'
import {
    messagesSentMetricPerAgentQueryFactory,
    messagesSentMetricPerTicketDrillDownQueryFactory,
    messagesSentQueryFactory,
    messagesSentTimeSeriesQueryFactory,
} from 'domains/reporting/models/queryFactories/support-performance/messagesSent'
import { withDefaultLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { TagFilterInstanceId } from 'domains/reporting/models/stat/types'
import type { ReportingQuery } from 'domains/reporting/models/types'
import {
    ReportingFilterOperator,
    ReportingGranularity,
} from 'domains/reporting/models/types'
import {
    DRILLDOWN_QUERY_LIMIT,
    formatReportingQueryDate,
    getFilterDateRange,
    NotSpamNorTrashedTicketsFilter,
    PublicAndMessageViaFilter,
    TicketDrillDownFilter,
} from 'domains/reporting/utils/reporting'
import { OrderDirection } from 'models/api/types'

describe('messagesSentQueryFactory', () => {
    const periodStart = formatReportingQueryDate(moment())
    const periodEnd = formatReportingQueryDate(moment())
    const statsFilters: StatsFilters = {
        period: {
            end_datetime: periodEnd,
            start_datetime: periodStart,
        },
    }
    const timezone = 'someTimeZone'

    it('should create a query', () => {
        const query: ReportingQuery<HelpdeskMessageCubeWithJoins> =
            messagesSentQueryFactory(statsFilters, timezone)

        expect(query).toEqual({
            metricName: METRIC_NAMES.SUPPORT_PERFORMANCE_MESSAGES_SENT,
            measures: [HelpdeskMessageMeasure.MessageCount],
            dimensions: [],
            filters: [
                {
                    member: TicketMember.PeriodStart,
                    operator: ReportingFilterOperator.AfterDate,
                    values: [periodStart],
                },
                {
                    member: TicketMember.PeriodEnd,
                    operator: ReportingFilterOperator.BeforeDate,
                    values: [periodEnd],
                },
                {
                    member: HelpdeskMessageMember.SentDatetime,
                    operator: ReportingFilterOperator.InDateRange,
                    values: [periodStart, periodEnd],
                },
                ...NotSpamNorTrashedTicketsFilter,
                ...PublicAndMessageViaFilter,
                {
                    member: HelpdeskMessageMember.PeriodStart,
                    operator: ReportingFilterOperator.AfterDate,
                    values: [periodStart],
                },
                {
                    member: HelpdeskMessageMember.PeriodEnd,
                    operator: ReportingFilterOperator.BeforeDate,
                    values: [periodEnd],
                },
            ],
            timezone,
        })
    })
})

describe('messagesSentTimeSeriesQueryFactory', () => {
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
        const query = messagesSentTimeSeriesQueryFactory(
            statsFilters,
            timezone,
            granularity,
        )

        expect(query).toEqual({
            metricName:
                METRIC_NAMES.SUPPORT_PERFORMANCE_MESSAGES_SENT_TIME_SERIES,
            measures: [HelpdeskMessageMeasure.MessageCount],
            dimensions: [],
            filters: [
                {
                    member: TicketMember.PeriodStart,
                    operator: ReportingFilterOperator.AfterDate,
                    values: [periodStart],
                },
                {
                    member: TicketMember.PeriodEnd,
                    operator: ReportingFilterOperator.BeforeDate,
                    values: [periodEnd],
                },
                {
                    member: HelpdeskMessageMember.SentDatetime,
                    operator: ReportingFilterOperator.InDateRange,
                    values: [periodStart, periodEnd],
                },
                ...NotSpamNorTrashedTicketsFilter,
                ...PublicAndMessageViaFilter,
                {
                    member: HelpdeskMessageMember.PeriodStart,
                    operator: ReportingFilterOperator.AfterDate,
                    values: [periodStart],
                },
                {
                    member: HelpdeskMessageMember.PeriodEnd,
                    operator: ReportingFilterOperator.BeforeDate,
                    values: [periodEnd],
                },
            ],
            timeDimensions: [
                {
                    dimension: HelpdeskMessageDimension.SentDatetime,
                    granularity,
                    dateRange: getFilterDateRange(statsFilters.period),
                },
            ],
            timezone,
        })
    })
})

describe('messagesSentMetricPerAgentQueryFactory', () => {
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
            messagesSentMetricPerAgentQueryFactory(statsFilters, timezone),
        ).toEqual({
            ...messagesSentQueryFactory(statsFilters, timezone),
            dimensions: [HelpdeskMessageDimension.SenderId],
            metricName:
                METRIC_NAMES.SUPPORT_PERFORMANCE_MESSAGES_SENT_PER_AGENT,
        })
    })

    it('should build a query with and agents sorting', () => {
        const agents = [2]
        const filters = {
            ...statsFilters,
            agents: withDefaultLogicalOperator(agents),
        }
        expect(
            messagesSentMetricPerAgentQueryFactory(filters, timezone, sorting),
        ).toEqual({
            ...messagesSentQueryFactory(filters, timezone),
            metricName:
                METRIC_NAMES.SUPPORT_PERFORMANCE_MESSAGES_SENT_PER_AGENT,
            dimensions: [HelpdeskMessageDimension.SenderId],
            order: [[HelpdeskMessageMeasure.MessageCount, sorting]],
        })
    })
})

describe('messagesSentMetricPerTicketQueryFactory', () => {
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
            messagesSentMetricPerTicketDrillDownQueryFactory(
                statsFilters,
                timezone,
            ),
        ).toEqual({
            ...messagesSentQueryFactory(statsFilters, timezone),
            metricName:
                METRIC_NAMES.SUPPORT_PERFORMANCE_MESSAGES_SENT_PER_TICKET_DRILL_DOWN,
            measures: [HelpdeskMessageMeasure.MessageCount],
            dimensions: [
                TicketDimension.TicketId,
                ...messagesSentQueryFactory(statsFilters, timezone).dimensions,
            ],
            filters: [
                ...messagesSentQueryFactory(statsFilters, timezone).filters,
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
            messagesSentMetricPerTicketDrillDownQueryFactory(
                filters,
                timezone,
                sorting,
            ),
        ).toEqual({
            ...messagesSentMetricPerAgentQueryFactory(filters, timezone),
            metricName:
                METRIC_NAMES.SUPPORT_PERFORMANCE_MESSAGES_SENT_PER_TICKET_DRILL_DOWN,
            measures: [HelpdeskMessageMeasure.MessageCount],
            dimensions: [TicketDimension.TicketId],
            filters: [
                ...messagesSentMetricPerAgentQueryFactory(filters, timezone)
                    .filters,
                TicketDrillDownFilter,
            ],
            limit: DRILLDOWN_QUERY_LIMIT,
            order: [[HelpdeskMessageMeasure.MessageCount, sorting]],
        })
    })
})
