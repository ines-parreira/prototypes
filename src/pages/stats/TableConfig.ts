import {TableColumn} from 'state/ui/stats/types'

export const TableColumnsOrder: TableColumn[] = [
    TableColumn.AgentName,
    TableColumn.CustomerSatisfaction,
    TableColumn.FirstResponseTime,
    TableColumn.ResolutionTime,
    TableColumn.ClosedTickets,
    TableColumn.PercentageOfClosedTickets,
    TableColumn.RepliedTickets,
    TableColumn.MessagesSent,
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

export const HeaderTooltips: Record<TableColumn, TooltipData | undefined> = {
    [TableColumn.AgentName]: undefined,
    [TableColumn.CustomerSatisfaction]: {
        title: 'Average CSAT score for tickets assigned to the agent that received a survey during the period',
        link: 'https://docs.gorgias.com/en-US/support-performance-overview-update-226700#1customer-satisfaction-csat',
    },

    [TableColumn.FirstResponseTime]: {
        title: 'Median time between 1st customer message and 1st agent response',
        link: 'https://docs.gorgias.com/en-US/support-performance-overview-update-226700#2-first-response-time',
    },
    [TableColumn.ResolutionTime]: {
        title: 'Median time between 1st customer message and last time the ticket was closed',
        link: 'https://docs.gorgias.com/en-US/support-performance-overview-update-226700#3-resolution-time',
    },
    [TableColumn.MessagesSent]: {
        title: 'Total number of messages sent by the agent',
        link: 'https://docs.gorgias.com/en-US/support-performance-overview-update-226700#5-messages-sent',
    },
    [TableColumn.PercentageOfClosedTickets]: {
        title: 'Proportion of closed tickets assigned to the agent compared to the total number of closed tickets assigned to all agents (excludes unassigned closed tickets)',
        link: '',
    },
    [TableColumn.ClosedTickets]: {
        title: 'Number of unique closed tickets assigned to the agent',
        link: 'https://docs.gorgias.com/en-US/support-performance-overview-update-226700#2-tickets-closed',
    },
    [TableColumn.RepliedTickets]: {
        title: 'Number of unique tickets where the agent sent a message',
        link: 'https://docs.gorgias.com/en-US/support-performance-overview-update-226700#4-tickets-replied',
    },
}
