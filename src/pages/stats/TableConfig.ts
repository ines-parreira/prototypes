export enum TableColumn {
    AgentName = 'agent_name',
    CustomerSatisfaction = 'customer_satisfaction',
    FirstResponseTime = 'first_response_time',
    ResolutionTime = 'resolution_time',
    MessagesSent = 'messages_sent',
    PercentageOfClosedTickets = 'percentage_of_closed_tickets',
    ClosedTickets = 'closed_tickets',
    RepliedTickets = 'replied_tickets',
}

export const TableColumnsOrder: TableColumn[] = [
    TableColumn.AgentName,
    TableColumn.FirstResponseTime,
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
