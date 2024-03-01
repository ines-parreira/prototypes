import {StatsFilters} from 'models/stat/types'

export type StatsState = {
    fetchingMap: {
        [key: string]: boolean | undefined
    }
    isFilterDirty: boolean
    cleanStatsFilters: StatsFilters | null
}

export enum OverviewMetric {
    CustomerSatisfaction = 'customer_satisfaction',
    MedianFirstResponseTime = 'median_first_response_time',
    MessagesPerTicket = 'messages_per_ticket',
    MessagesSent = 'messages_sent',
    OpenTickets = 'open_tickets',
    MedianResolutionTime = 'median_resolution_time',
    TicketsClosed = 'tickets_closed',
    TicketsCreated = 'tickets_created',
    TicketsReplied = 'tickets_replied',
    OneTouchTickets = 'one_touch_tickets',
    TicketHandleTime = 'ticket_handle_time',
}

export enum TableColumn {
    AgentName = 'agent_name',
    CustomerSatisfaction = 'agent_customer_satisfaction',
    MedianFirstResponseTime = 'agent_median_first_response_time',
    MedianResolutionTime = 'agent_median_resolution_time',
    MessagesSent = 'agent_messages_sent',
    PercentageOfClosedTickets = 'agent_percentage_of_closed_tickets',
    ClosedTickets = 'agent_closed_tickets',
    RepliedTickets = 'agent_replied_tickets',
    OneTouchTickets = 'agent_one_touch_tickets',
    OnlineTime = 'agent_online_time',
    MessagesSentPerHour = 'agent_messages_sent_per_hour',
}

export enum TicketFieldsMetric {
    TicketCustomFieldsTicketCount = 'ticket_custom_fields_ticket_count',
}

export enum TableViewIdentifier {
    AgentPerformanceMetrics = 'agent_performance_metrics',
}

export type TableViewColumn = {
    id: TableColumn
    visibility: boolean | null
}

export type TableView = {
    id: string
    name: string
    metrics: TableViewColumn[]
}

export type TableSetting = {
    active_view: TableViewIdentifier | string
    views: TableView[]
}
