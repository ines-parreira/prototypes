import moment from 'moment'

import { TicketChannel } from 'business/types/ticket'
import {
    HelpdeskCustomerMessagesReceivedEnrichedMeasure,
    HelpdeskCustomerMessagesReceivedEnrichedMember,
} from 'domains/reporting/models/cubes/HelpdeskCustomerMessagesReceivedEnrichedCube'
import {
    TicketDimension,
    TicketMember,
} from 'domains/reporting/models/cubes/TicketCube'
import { CHANNEL_DIMENSION } from 'domains/reporting/models/queryFactories/support-performance/constants'
import {
    messagesReceivedMetricPerAgentQueryFactory,
    messagesReceivedMetricPerChannelQueryFactory,
    messagesReceivedMetricPerTicketDrillDownQueryFactory,
    messagesReceivedQueryFactory,
    messagesReceivedTimeSeriesQueryFactory,
} from 'domains/reporting/models/queryFactories/support-performance/messagesReceived'
import { withDefaultLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import { StatsFilters } from 'domains/reporting/models/stat/types'
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

describe('messagesReceivedQueryFactory', () => {
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
        const query = messagesReceivedQueryFactory(statsFilters, timezone)

        expect(query).toEqual({
            measures: [
                HelpdeskCustomerMessagesReceivedEnrichedMeasure.MessageCount,
            ],
            dimensions: [],
            filters: [
                ...NotSpamNorTrashedTicketsFilter,
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
            ],
            timezone,
        })
    })
})

describe('messagesReceivedTimeSeriesQueryFactory', () => {
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
        const query = messagesReceivedTimeSeriesQueryFactory(
            statsFilters,
            timezone,
            granularity,
        )

        expect(query).toEqual({
            measures: [
                HelpdeskCustomerMessagesReceivedEnrichedMeasure.MessageCount,
            ],
            dimensions: [],
            filters: [
                ...NotSpamNorTrashedTicketsFilter,
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
            ],
            timeDimensions: [
                {
                    dimension:
                        HelpdeskCustomerMessagesReceivedEnrichedMember.SentDatetime,
                    granularity,
                    dateRange: getFilterDateRange(statsFilters.period),
                },
            ],
            timezone,
        })
    })
})

describe('messagesReceivedMetricPerAgentQueryFactory', () => {
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
    }
    const timezone = 'someTimeZone'
    const sorting = OrderDirection.Asc

    it('should build a query', () => {
        expect(
            messagesReceivedMetricPerAgentQueryFactory(statsFilters, timezone),
        ).toEqual({
            ...messagesReceivedQueryFactory(statsFilters, timezone),
            dimensions: [TicketDimension.AssigneeUserId],
        })
    })

    it('should build a query with and agents sorting', () => {
        const agents = [2]
        const filters = {
            ...statsFilters,
            agents: withDefaultLogicalOperator(agents),
        }
        expect(
            messagesReceivedMetricPerAgentQueryFactory(
                filters,
                timezone,
                sorting,
            ),
        ).toEqual({
            ...messagesReceivedQueryFactory(filters, timezone),
            dimensions: [TicketDimension.AssigneeUserId],
            order: [
                [
                    HelpdeskCustomerMessagesReceivedEnrichedMeasure.MessageCount,
                    sorting,
                ],
            ],
        })
    })
})

describe('messagesReceivedMetricPerChannelQueryFactory', () => {
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
    }
    const timezone = 'someTimeZone'
    const sorting = OrderDirection.Asc

    it('should build a query', () => {
        expect(
            messagesReceivedMetricPerChannelQueryFactory(
                statsFilters,
                timezone,
            ),
        ).toEqual({
            ...messagesReceivedQueryFactory(statsFilters, timezone),
            dimensions: [CHANNEL_DIMENSION],
        })
    })

    it('should build a query with selected sorting direction', () => {
        expect(
            messagesReceivedMetricPerAgentQueryFactory(
                statsFilters,
                timezone,
                sorting,
            ),
        ).toEqual({
            ...messagesReceivedQueryFactory(statsFilters, timezone),
            dimensions: [TicketDimension.AssigneeUserId],
            order: [
                [
                    HelpdeskCustomerMessagesReceivedEnrichedMeasure.MessageCount,
                    sorting,
                ],
            ],
        })
    })
})

describe('messagesReceivedMetricPerTicketQueryFactory', () => {
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
    }
    const timezone = 'someTimeZone'
    const sorting = OrderDirection.Asc

    it('should build a query', () => {
        expect(
            messagesReceivedMetricPerTicketDrillDownQueryFactory(
                statsFilters,
                timezone,
            ),
        ).toEqual({
            ...messagesReceivedQueryFactory(statsFilters, timezone),
            measures: [
                HelpdeskCustomerMessagesReceivedEnrichedMeasure.MessageCount,
            ],
            dimensions: [
                TicketDimension.TicketId,
                ...messagesReceivedQueryFactory(statsFilters, timezone)
                    .dimensions,
            ],
            filters: [
                ...messagesReceivedQueryFactory(statsFilters, timezone).filters,
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
            messagesReceivedMetricPerTicketDrillDownQueryFactory(
                filters,
                timezone,
                sorting,
            ),
        ).toEqual({
            ...messagesReceivedMetricPerAgentQueryFactory(filters, timezone),
            measures: [
                HelpdeskCustomerMessagesReceivedEnrichedMeasure.MessageCount,
            ],
            dimensions: [TicketDimension.TicketId],
            filters: [
                ...messagesReceivedMetricPerAgentQueryFactory(filters, timezone)
                    .filters,
                TicketDrillDownFilter,
            ],
            limit: DRILLDOWN_QUERY_LIMIT,
            order: [
                [
                    HelpdeskCustomerMessagesReceivedEnrichedMeasure.MessageCount,
                    sorting,
                ],
            ],
        })
    })
})
