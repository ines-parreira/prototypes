import {StatsFilters} from 'models/stat/types'
import {ChannelsTableColumns} from 'pages/stats/support-performance/channels/ChannelsTableConfig'

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

export enum AgentsTableColumn {
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
    RepliedTicketsPerHour = 'agent_replied_tickets_per_hour',
    ClosedTicketsPerHour = 'agent_closed_tickets_per_hour',
    TicketHandleTime = 'agent_ticket_handle_time',
}

export enum TicketFieldsMetric {
    TicketCustomFieldsTicketCount = 'ticket_custom_fields_ticket_count',
}

export enum SlaMetric {
    AchievementRate = 'sla-achievement-rate',
    BreachedTicketsRate = 'sla-breached-tickets-rate',
}

export enum ConvertMetric {
    CampaignSalesCount = 'campaign_sales_count',
}

export enum VoiceMetric {
    AverageWaitTime = 'average_wait_time',
    AverageTalkTime = 'average_talk_time',
}

export enum AgentsTableViewIdentifier {
    AgentPerformanceMetrics = 'agent_performance_metrics',
}

export enum ChannelsTableViewIdentifier {
    ChannelsReport = 'channelsReport',
}

export type TableViewColumn<T> = {
    id: T
    visibility: boolean | null
}

export type TableView<T> = {
    id: string
    name: string
    metrics: TableViewColumn<T>[]
}

export type TableSetting<T> = {
    active_view: string
    views: TableView<T>[]
}

export type TableColumnSet = AgentsTableColumn | ChannelsTableColumns
