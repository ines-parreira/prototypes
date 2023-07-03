import {TicketMessageSourceType} from 'business/types/ticket'
import {
    HelpdeskMessageMeasure,
    HelpdeskMessageMember,
    ReportingFilter,
    ReportingFilterOperator,
    TicketMeasure,
    TicketMember,
    TicketSegment,
} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'
import {
    statsFiltersToReportingFilters,
    TicketStatsFiltersMembers,
    HelpdeskMessagesStatsFiltersMembers,
} from 'utils/reporting'

import createUseMetricTrend from './createUseMetricTrend'

export const NotSpamNorTrashedTicketsFilter = [
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
]

export const useCustomerSatisfactionTrend = createUseMetricTrend(
    (filters, timezone) => ({
        measures: [TicketMeasure.SurveyScore],
        dimensions: [],
        timezone,
        segments: [TicketSegment.SurveyScored],
        filters: [
            ...NotSpamNorTrashedTicketsFilter,
            ...statsFiltersToReportingFilters(
                TicketStatsFiltersMembers,
                filters
            ),
        ],
    })
)

export const useFirstResponseTimeTrend = createUseMetricTrend(
    (filters, timezone) => {
        const {agents, ...statFiltersWithoutAgents} = filters
        const commonFilters: ReportingFilter[] = [
            ...NotSpamNorTrashedTicketsFilter,
            {
                member: TicketMember.FirstHelpdeskMessageDatetime,
                operator: ReportingFilterOperator.InDateRange,
                values: [
                    filters.period.start_datetime,
                    filters.period.end_datetime,
                ],
            },
        ]
        if (agents?.length) {
            commonFilters.push({
                member: TicketMember.FirstHelpdeskMessageUserId,
                operator: ReportingFilterOperator.Equals,
                values: agents.map((agent) => agent.toString()),
            })
        }

        return {
            measures: [TicketMeasure.FirstResponseTime],
            dimensions: [],
            timezone,
            segments: [TicketSegment.ConversationStarted],
            filters: [
                ...commonFilters,
                ...statsFiltersToReportingFilters(
                    TicketStatsFiltersMembers,
                    statFiltersWithoutAgents
                ),
            ],
        }
    }
)

export const useMessagesPerTicketTrend = createUseMetricTrend(
    (filters, timezone) => ({
        measures: [TicketMeasure.MessagesAverage],
        dimensions: [],
        timezone,
        segments: [
            TicketSegment.ClosedTickets,
            TicketSegment.ConversationStarted,
        ],
        filters: [
            ...NotSpamNorTrashedTicketsFilter,
            ...statsFiltersToReportingFilters(
                TicketStatsFiltersMembers,
                filters
            ),
        ],
    })
)

export const useResolutionTimeTrend = createUseMetricTrend(
    (filters, timezone) => ({
        measures: [TicketMeasure.ResolutionTime],
        dimensions: [],
        timezone,
        segments: [
            TicketSegment.ClosedTickets,
            TicketSegment.ConversationStarted,
        ],
        filters: [
            ...NotSpamNorTrashedTicketsFilter,
            ...statsFiltersToReportingFilters(
                TicketStatsFiltersMembers,
                filters
            ),
        ],
    })
)

export const useOpenTicketsTrend = createUseMetricTrend(
    (filters, timezone) => ({
        measures: [TicketMeasure.TicketCount],
        dimensions: [],
        timezone,
        filters: [
            ...NotSpamNorTrashedTicketsFilter,
            {
                member: TicketMember.Status,
                operator: ReportingFilterOperator.Equals,
                values: ['open'],
            },
            ...statsFiltersToReportingFilters(
                TicketStatsFiltersMembers,
                filters
            ).filter(
                (filter) =>
                    filter.member !== TicketStatsFiltersMembers.periodStart
            ),
        ],
    })
)

export const useClosedTicketsTrend = createUseMetricTrend(
    (filters, timezone) => ({
        measures: [TicketMeasure.TicketCount],
        dimensions: [],
        timezone,
        segments: [TicketSegment.ClosedTickets],
        filters: [
            ...NotSpamNorTrashedTicketsFilter,
            ...statsFiltersToReportingFilters(
                TicketStatsFiltersMembers,
                filters
            ),
        ],
    })
)

export const useTicketsCreatedTrend = createUseMetricTrend(
    (filters, timezone) => ({
        measures: [TicketMeasure.TicketCount],
        dimensions: [],
        timezone,
        filters: [
            {
                member: TicketMember.CreatedDatetime,
                operator: ReportingFilterOperator.InDateRange,
                values: [
                    filters.period.start_datetime,
                    filters.period.end_datetime,
                ],
            },
            ...NotSpamNorTrashedTicketsFilter,
            ...statsFiltersToReportingFilters(
                TicketStatsFiltersMembers,
                filters
            ),
        ],
    })
)

export const getTicketsRepliedQueryFactory = (
    filters: StatsFilters,
    timezone: string
) => ({
    measures: [HelpdeskMessageMeasure.TicketCount],
    dimensions: [],
    timezone,
    filters: [
        ...NotSpamNorTrashedTicketsFilter,
        {
            member: HelpdeskMessageMember.SentDatetime,
            operator: ReportingFilterOperator.InDateRange,
            values: [
                filters.period.start_datetime,
                filters.period.end_datetime,
            ],
        },
        {
            member: TicketMember.PeriodEnd,
            operator: ReportingFilterOperator.BeforeDate,
            values: [filters.period.end_datetime],
        },
        {
            member: TicketMember.FirstMessageChannel,
            operator: ReportingFilterOperator.NotEquals,
            values: [TicketMessageSourceType.InternalNote],
        },
        ...statsFiltersToReportingFilters(
            HelpdeskMessagesStatsFiltersMembers,
            filters
        ),
    ],
})

export const useTicketsRepliedTrend = createUseMetricTrend(
    getTicketsRepliedQueryFactory
)

export const getMessagesSentQueryFactory = (
    filters: StatsFilters,
    timezone: string
) => ({
    measures: [HelpdeskMessageMeasure.MessageCount],
    dimensions: [],
    timezone,
    filters: [
        {
            member: TicketMember.PeriodEnd,
            operator: ReportingFilterOperator.BeforeDate,
            values: [filters.period.end_datetime],
        },
        {
            member: HelpdeskMessageMember.SentDatetime,
            operator: ReportingFilterOperator.InDateRange,
            values: [
                filters.period.start_datetime,
                filters.period.end_datetime,
            ],
        },
        ...statsFiltersToReportingFilters(
            HelpdeskMessagesStatsFiltersMembers,
            filters
        ),
    ],
})

export const useMessagesSentTrend = createUseMetricTrend(
    getMessagesSentQueryFactory
)
