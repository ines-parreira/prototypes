import {
    MessageStateMeasure,
    MessageStateMember,
    OpenTicketStateMeasure,
    OpenTicketStateMember,
    ReportingFilter,
    ReportingFilterOperator,
    TicketStateMeasure,
    TicketStateMember,
    TicketStateSegment,
} from 'models/reporting/types'
import {statsFiltersToReportingFilters} from 'utils/reporting'

import createUseMetricTrend from './createUseMetricTrend'

export const useCustomerSatisfactionTrend = createUseMetricTrend((filters) => ({
    measures: [TicketStateMeasure.SurveyScore],
    dimensions: [],
    segments: [TicketStateSegment.SurveyScored],
    filters: statsFiltersToReportingFilters(TicketStateMember, filters),
}))

export const useFirstResponseTimeTrend = createUseMetricTrend(
    (statsFilters) => {
        const {agents, ...statFiltersWithoutAgents} = statsFilters
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
                    statsFilters.period.start_datetime,
                    statsFilters.period.end_datetime,
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
            segments: [TicketStateSegment.ConversationStarted],
            filters: [
                ...commonFilters,
                ...statsFiltersToReportingFilters(
                    TicketStateMember,
                    statFiltersWithoutAgents
                ),
            ],
        }
    }
)

export const useMessagesPerTicketTrend = createUseMetricTrend((filters) => ({
    measures: [TicketStateMeasure.MessagesAverage],
    dimensions: [],
    segments: [
        TicketStateSegment.ClosedTickets,
        TicketStateSegment.ConversationStarted,
    ],
    filters: statsFiltersToReportingFilters(TicketStateMember, filters),
}))

export const useResolutionTimeTrend = createUseMetricTrend((filters) => ({
    measures: [TicketStateMeasure.ResolutionTime],
    dimensions: [],
    segments: [
        TicketStateSegment.ClosedTickets,
        TicketStateSegment.ConversationStarted,
    ],
    filters: statsFiltersToReportingFilters(TicketStateMember, filters),
}))

export const useOpenTicketsTrend = createUseMetricTrend((filters) => ({
    measures: [OpenTicketStateMeasure.TicketCount],
    dimensions: [],
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
        ...statsFiltersToReportingFilters(OpenTicketStateMember, filters),
    ],
}))

export const useClosedTicketsTrend = createUseMetricTrend((filters) => ({
    measures: [TicketStateMeasure.TicketCount],
    dimensions: [],
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
        ...statsFiltersToReportingFilters(TicketStateMember, filters),
    ],
}))

export const useTicketsCreatedTrend = createUseMetricTrend((filters) => ({
    measures: [TicketStateMeasure.TicketCount],
    dimensions: [],
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
        ...statsFiltersToReportingFilters(TicketStateMember, filters),
    ],
}))

export const useTicketsRepliedTrend = createUseMetricTrend((filters) => ({
    measures: [MessageStateMeasure.TicketCount],
    dimensions: [],
    filters: statsFiltersToReportingFilters(MessageStateMember, filters),
}))

export const useMessagesSentTrend = createUseMetricTrend((filters) => ({
    measures: [MessageStateMeasure.MessageCount],
    dimensions: [],
    filters: statsFiltersToReportingFilters(MessageStateMember, filters),
}))
