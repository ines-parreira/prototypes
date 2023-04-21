import {
    MessageStateMeasure,
    OpenTicketStateMeasure,
    OpenTicketStateMember,
    ReportingFilter,
    ReportingFilterOperator,
    TicketStateMeasure,
    TicketStateMember,
    TicketStateSegment,
} from 'models/reporting/types'
import {
    MessageStateStatsFiltersMembers,
    OpenTicketStateStatsFiltersMembers,
    statsFiltersToReportingFilters,
    TicketStateStatsFiltersMembers,
} from 'utils/reporting'

import createUseMetricTrend from './createUseMetricTrend'

export const useCustomerSatisfactionTrend = createUseMetricTrend(
    (filters, timezone) => ({
        measures: [TicketStateMeasure.SurveyScore],
        dimensions: [],
        timezone,
        segments: [TicketStateSegment.SurveyScored],
        filters: statsFiltersToReportingFilters(
            TicketStateStatsFiltersMembers,
            filters
        ),
    })
)

export const useFirstResponseTimeTrend = createUseMetricTrend(
    (filters, timezone) => {
        const {agents, ...statFiltersWithoutAgents} = filters
        const commonFilters: ReportingFilter[] = [
            {
                member: TicketStateMember.IsTrashed,
                operator: ReportingFilterOperator.Equals,
                values: ['0'],
            },
            {
                member: TicketStateMember.IsSpam,
                operator: ReportingFilterOperator.Equals,
                values: ['0'],
            },
            {
                member: TicketStateMember.FirstHelpdeskMessageDatetime,
                operator: ReportingFilterOperator.InDateRange,
                values: [
                    filters.period.start_datetime,
                    filters.period.end_datetime,
                ],
            },
        ]
        if (agents?.length) {
            commonFilters.push({
                member: TicketStateMember.FirstHelpdeskMessageUserId,
                operator: ReportingFilterOperator.Equals,
                values: agents.map((agent) => agent.toString()),
            })
        }

        return {
            measures: [TicketStateMeasure.FirstResponseTime],
            dimensions: [],
            timezone,
            segments: [TicketStateSegment.ConversationStarted],
            filters: [
                ...commonFilters,
                ...statsFiltersToReportingFilters(
                    TicketStateStatsFiltersMembers,
                    statFiltersWithoutAgents
                ),
            ],
        }
    }
)

export const useMessagesPerTicketTrend = createUseMetricTrend(
    (filters, timezone) => ({
        measures: [TicketStateMeasure.MessagesAverage],
        dimensions: [],
        timezone,
        segments: [
            TicketStateSegment.ClosedTickets,
            TicketStateSegment.ConversationStarted,
        ],
        filters: statsFiltersToReportingFilters(
            TicketStateStatsFiltersMembers,
            filters
        ),
    })
)

export const useResolutionTimeTrend = createUseMetricTrend(
    (filters, timezone) => ({
        measures: [TicketStateMeasure.ResolutionTime],
        dimensions: [],
        timezone,
        segments: [
            TicketStateSegment.ClosedTickets,
            TicketStateSegment.ConversationStarted,
        ],
        filters: statsFiltersToReportingFilters(
            TicketStateStatsFiltersMembers,
            filters
        ),
    })
)

export const useOpenTicketsTrend = createUseMetricTrend(
    (filters, timezone) => ({
        measures: [OpenTicketStateMeasure.TicketCount],
        dimensions: [],
        timezone,
        filters: [
            {
                member: OpenTicketStateMember.IsTrashed,
                operator: ReportingFilterOperator.Equals,
                values: ['0'],
            },
            {
                member: OpenTicketStateMember.IsSpam,
                operator: ReportingFilterOperator.Equals,
                values: ['0'],
            },
            ...statsFiltersToReportingFilters(
                OpenTicketStateStatsFiltersMembers,
                filters
            ).filter(
                (filter) =>
                    filter.member !==
                    OpenTicketStateStatsFiltersMembers.periodStart
            ),
        ],
    })
)

export const useClosedTicketsTrend = createUseMetricTrend(
    (filters, timezone) => ({
        measures: [TicketStateMeasure.TicketCount],
        dimensions: [],
        timezone,
        segments: [TicketStateSegment.ClosedTickets],
        filters: [
            {
                member: TicketStateMember.IsTrashed,
                operator: ReportingFilterOperator.Equals,
                values: ['0'],
            },
            {
                member: TicketStateMember.IsSpam,
                operator: ReportingFilterOperator.Equals,
                values: ['0'],
            },
            ...statsFiltersToReportingFilters(
                TicketStateStatsFiltersMembers,
                filters
            ),
        ],
    })
)

export const useTicketsCreatedTrend = createUseMetricTrend(
    (filters, timezone) => ({
        measures: [TicketStateMeasure.TicketCount],
        dimensions: [],
        timezone,
        filters: [
            {
                member: TicketStateMember.IsTrashed,
                operator: ReportingFilterOperator.Equals,
                values: ['0'],
            },
            {
                member: TicketStateMember.IsSpam,
                operator: ReportingFilterOperator.Equals,
                values: ['0'],
            },
            ...statsFiltersToReportingFilters(
                TicketStateStatsFiltersMembers,
                filters
            ),
        ],
    })
)

export const useTicketsRepliedTrend = createUseMetricTrend(
    (filters, timezone) => ({
        measures: [MessageStateMeasure.TicketCount],
        dimensions: [],
        timezone,
        filters: statsFiltersToReportingFilters(
            MessageStateStatsFiltersMembers,
            filters
        ),
    })
)

export const useMessagesSentTrend = createUseMetricTrend(
    (filters, timezone) => ({
        measures: [MessageStateMeasure.MessageCount],
        dimensions: [],
        timezone,
        filters: statsFiltersToReportingFilters(
            MessageStateStatsFiltersMembers,
            filters
        ),
    })
)
