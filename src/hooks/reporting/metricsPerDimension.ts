import {
    closedTicketsQueryFactory,
    resolutionTimeQueryFactory,
    customerSatisfactionQueryFactory,
    getMessagesSentQueryFactory,
    getTicketsRepliedQueryFactory,
    firstResponseTimeQueryFactory,
} from 'hooks/reporting/metricTrends'
import {
    Metric,
    useMetricPerDimension,
} from 'hooks/reporting/useMetricPerDimension'
import {OrderDirection} from 'models/api/types'
import {
    HelpdeskMessageDimension,
    HelpdeskMessageMeasure,
    ReportingQuery,
    TicketDimension,
    TicketMeasure,
} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'

export const firstResponseTimeMetricPerAgentQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection
): ReportingQuery => ({
    ...firstResponseTimeQueryFactory(filters, timezone),
    dimensions: [TicketDimension.FirstHelpdeskMessageUserId],
    ...(sorting
        ? {
              order: [[TicketMeasure.FirstResponseTime, sorting]],
          }
        : {}),
})

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
    dimensions: [HelpdeskMessageDimension.SenderId],
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

export const closedTicketsPerAgentQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection
): ReportingQuery => ({
    ...closedTicketsQueryFactory(filters, timezone),
    dimensions: [TicketDimension.AssigneeUserId],

    ...(sorting
        ? {
              order: [[TicketMeasure.TicketCount, sorting]],
          }
        : {}),
})

export const useClosedTicketsMetricPerAgent = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    agentAssigneeId?: string
): Metric =>
    useMetricPerDimension(
        closedTicketsPerAgentQueryFactory(statsFilters, timezone, sorting),
        agentAssigneeId
    )

export const messagesSentMetricPerAgentQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection
): ReportingQuery => ({
    ...getMessagesSentQueryFactory(filters, timezone),
    dimensions: [HelpdeskMessageDimension.SenderId],
    ...(sorting
        ? {
              order: [[HelpdeskMessageMeasure.MessageCount, sorting]],
          }
        : {}),
})

export const useMessagesSentMetricPerAgent = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    agentAssigneeId?: string
): Metric =>
    useMetricPerDimension(
        messagesSentMetricPerAgentQueryFactory(statsFilters, timezone, sorting),
        agentAssigneeId
    )

export const resolutionTimeMetricPerAgentQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection
): ReportingQuery => ({
    ...resolutionTimeQueryFactory(filters, timezone),
    dimensions: [TicketDimension.AssigneeUserId],
    ...(sorting
        ? {
              order: [[TicketMeasure.ResolutionTime, sorting]],
          }
        : {}),
})

export const useResolutionTimeMetricPerAgent = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    agentAssigneeId?: string
): Metric =>
    useMetricPerDimension(
        resolutionTimeMetricPerAgentQueryFactory(
            statsFilters,
            timezone,
            sorting
        ),
        agentAssigneeId
    )

export const customerSatisfactionMetricPerAgentQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection
): ReportingQuery => ({
    ...customerSatisfactionQueryFactory(filters, timezone),
    dimensions: [TicketDimension.AssigneeUserId],
    ...(sorting
        ? {
              order: [[TicketMeasure.SurveyScore, sorting]],
          }
        : {}),
})

export const useCustomerSatisfactionMetricPerAgent = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    agentAssigneeId?: string
): Metric =>
    useMetricPerDimension(
        customerSatisfactionMetricPerAgentQueryFactory(
            statsFilters,
            timezone,
            sorting
        ),
        agentAssigneeId
    )
