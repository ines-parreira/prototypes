import {TableColumn} from 'state/ui/stats/types'

export const TableColumnsOrder: TableColumn[] = [
    TableColumn.AgentName,
    TableColumn.CustomerSatisfaction,
    TableColumn.FirstResponseTime,
    TableColumn.ResolutionTime,
    TableColumn.RepliedTickets,
    TableColumn.ClosedTickets,
    TableColumn.PercentageOfClosedTickets,
    TableColumn.MessagesSent,
]

export const TableLabels: Record<TableColumn, string> = {
    [TableColumn.AgentName]: 'Agent',
    [TableColumn.CustomerSatisfaction]: 'Customer Satisfaction',
    [TableColumn.FirstResponseTime]: 'First Response Time',
    [TableColumn.ResolutionTime]: 'Resolution Time',
    [TableColumn.MessagesSent]: 'Messages Sent',
    [TableColumn.PercentageOfClosedTickets]: 'Percentage of Closed Tickets',
    [TableColumn.ClosedTickets]: 'Closed Tickets',
    [TableColumn.RepliedTickets]: 'Tickets Replied',
}
