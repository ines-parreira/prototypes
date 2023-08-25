import {
    useClosedTicketsMetricPerAgent,
    useCustomerSatisfactionMetricPerAgent,
    useFirstResponseTimeMetricPerAgent,
    useMessagesSentMetricPerAgent,
    useResolutionTimeMetricPerAgent,
    useTicketsRepliedMetricPerAgent,
} from 'hooks/reporting/metricsPerDimension'
import {Metric} from 'hooks/reporting/useMetricPerDimension'
import {OrderDirection} from 'models/api/types'
import {StatsFilters} from 'models/stat/types'
import {TableColumn} from 'state/ui/stats/types'

export const TableColumnsOrder: TableColumn[] = [
    TableColumn.AgentName,
    TableColumn.ClosedTickets,
    TableColumn.PercentageOfClosedTickets,
    TableColumn.CustomerSatisfaction,
    TableColumn.RepliedTickets,
    TableColumn.MessagesSent,
    TableColumn.FirstResponseTime,
    TableColumn.ResolutionTime,
]

export const TableLabels: Record<TableColumn, string> = {
    [TableColumn.AgentName]: 'Agent',
    [TableColumn.CustomerSatisfaction]: 'Customer Satisfaction',
    [TableColumn.FirstResponseTime]: 'First Response Time',
    [TableColumn.ResolutionTime]: 'Resolution Time',
    [TableColumn.ClosedTickets]: 'Closed Tickets',
    [TableColumn.PercentageOfClosedTickets]: '% of Closed Tickets',
    [TableColumn.RepliedTickets]: 'Tickets Replied',
    [TableColumn.MessagesSent]: 'Messages Sent',
}

export type TooltipData = {title: string; link: string}

export const AGENT_NAME_COLUMN_WIDTH = 200
export const METRIC_COLUMN_WIDTH = 160

export const HeaderTooltips: Record<TableColumn, TooltipData | undefined> = {
    [TableColumn.AgentName]: undefined,
    [TableColumn.CustomerSatisfaction]: {
        title: 'Average CSAT score for tickets assigned to the agent for which a survey was sent within the timeframe; surveys are sent following ticket resolution',
        link: 'https://docs.gorgias.com/en-US/agents-report-292100#1-customer-satisfaction-csat',
    },
    [TableColumn.FirstResponseTime]: {
        title: 'Median time between 1st customer message and 1st agent response, for tickets where the response was sent within the selected timeframe',
        link: 'https://docs.gorgias.com/en-US/agents-report-292100#2-first-response-time',
    },
    [TableColumn.ResolutionTime]: {
        title: 'Median time between 1st customer message and the last time the ticket was closed, for tickets closed within the selected timeframe',
        link: 'https://docs.gorgias.com/en-US/agents-report-292100#3-resolution-time',
    },
    [TableColumn.MessagesSent]: {
        title: 'Total number of messages sent by the agent within the selected timeframe',
        link: 'https://docs.gorgias.com/en-US/agents-report-292100#7-messages-sent',
    },
    [TableColumn.PercentageOfClosedTickets]: {
        title: 'Proportion of closed tickets assigned to the agent compared to the total number of closed tickets assigned to all agents (excludes unassigned closed tickets)',
        link: 'https://docs.gorgias.com/en-US/agents-report-292100#5-proportion--of-closed-tickets',
    },
    [TableColumn.ClosedTickets]: {
        title: 'Number of unique closed tickets within the selected timeframe (that did not reopen), assigned to selected agent(s)/team(s)',
        link: 'https://docs.gorgias.com/en-US/agents-report-292100#4-closed-tickets',
    },
    [TableColumn.RepliedTickets]: {
        title: 'Number of unique tickets where the agent sent a message within the selected timeframe',
        link: 'https://docs.gorgias.com/en-US/agents-report-292100#6-tickets-replied',
    },
}

export const getColumnWidth = (column: TableColumn) =>
    column === TableColumn.AgentName
        ? AGENT_NAME_COLUMN_WIDTH
        : METRIC_COLUMN_WIDTH

export const getColumnAlignment = (column: TableColumn) =>
    column === TableColumn.AgentName ? 'left' : 'right'

export const getQuery = (
    column: TableColumn
): ((
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    agentAssigneeId?: string
) => Metric) => {
    switch (column) {
        case TableColumn.AgentName:
            return () => ({
                isFetching: false,
                isError: false,
                data: null,
            })
        case TableColumn.FirstResponseTime:
            return useFirstResponseTimeMetricPerAgent
        case TableColumn.RepliedTickets:
            return useTicketsRepliedMetricPerAgent
        case TableColumn.PercentageOfClosedTickets:
        case TableColumn.ClosedTickets:
            return useClosedTicketsMetricPerAgent
        case TableColumn.MessagesSent:
            return useMessagesSentMetricPerAgent
        case TableColumn.ResolutionTime:
            return useResolutionTimeMetricPerAgent
        case TableColumn.CustomerSatisfaction:
            return useCustomerSatisfactionMetricPerAgent
    }
}
