import {
    getTicketsRepliedQueryFactory,
    NotSpamNorTrashedTicketsFilter,
} from 'hooks/reporting/metricTrends'
import {
    Metric,
    useMetricPerDimension,
} from 'hooks/reporting/useMetricPerDimension'
import {OrderDirection} from 'models/api/types'
import {
    HelpdeskMessageMeasure,
    ReportingFilter,
    ReportingFilterOperator,
    ReportingQuery,
    TicketDimension,
    TicketMeasure,
    TicketMember,
    TicketSegment,
} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'
import {
    formatReportingQueryDate,
    statsFiltersToReportingFilters,
    TicketStatsFiltersMembers,
} from 'utils/reporting'

export const firstResponseTimeMetricPerAgentQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection
): ReportingQuery => {
    const {agents, ...statFiltersWithoutAgents} = filters
    const commonFilters: ReportingFilter[] = [
        ...NotSpamNorTrashedTicketsFilter,
        {
            member: TicketMember.FirstHelpdeskMessageDatetime,
            operator: ReportingFilterOperator.InDateRange,
            values: [
                formatReportingQueryDate(filters.period.start_datetime),
                formatReportingQueryDate(filters.period.end_datetime),
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
        dimensions: [TicketDimension.AssigneeUserId],
        timezone,
        segments: [TicketSegment.ConversationStarted],
        filters: [
            ...commonFilters,
            ...statsFiltersToReportingFilters(
                TicketStatsFiltersMembers,
                statFiltersWithoutAgents
            ),
        ],
        ...(sorting
            ? {
                  order: [[TicketMeasure.FirstResponseTime, sorting]],
              }
            : {}),
    }
}

export const useFirstResponseTimeMetricPerAgent = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    agentAssigneeId?: string
): Metric =>
    useMetricPerDimension(
        firstResponseTimeMetricPerAgentQueryFactory(
            statsFilters,
            timezone,
            sorting
        ),
        agentAssigneeId
    )

export const ticketsRepliedMetricPerAgentQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection
): ReportingQuery => ({
    ...getTicketsRepliedQueryFactory(filters, timezone),
    dimensions: [TicketDimension.AssigneeUserId],
    ...(sorting
        ? {
              order: [[HelpdeskMessageMeasure.TicketCount, sorting]],
          }
        : {}),
})

export const useTicketsRepliedMetricPerAgent = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    agentAssigneeId?: string
): Metric =>
    useMetricPerDimension(
        ticketsRepliedMetricPerAgentQueryFactory(
            statsFilters,
            timezone,
            sorting
        ),
        agentAssigneeId
    )
