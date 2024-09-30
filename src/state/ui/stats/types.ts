import {StatsFiltersWithLogicalOperator} from 'models/stat/types'
import {AutoQAAgentsTableColumn} from 'pages/stats/support-performance/auto-qa/AutoQAAgentsTableConfig'
import {ChannelsTableColumns} from 'pages/stats/support-performance/channels/ChannelsTableConfig'
import {CampaignTableKeys} from 'pages/stats/convert/types/enums/CampaignTableKeys.enum'

import {AgentPerformanceState} from 'state/ui/stats/agentPerformanceSlice'
import {
    AGENT_PERFORMANCE_SLICE_NAME,
    AUTO_QA_AGENT_PERFORMANCE_SLICE_NAME,
} from 'state/ui/stats/constants'

export type StatsState = {
    fetchingMap: {
        [key: string]: boolean | undefined
    }
    isFilterDirty: boolean
    cleanStatsFilters: StatsFiltersWithLogicalOperator | null
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

export enum AutoQAMetric {
    ReviewedClosedTickets = 'auto_qa_reviewed_closed_tickets',
    ResolutionCompleteness = 'auto_qa_resolution_completeness',
    CommunicationSkills = 'auto_qa_communication_skills',
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
    QueueAverageWaitTime = 'queue_average_wait_time',
    QueueAverageTalkTime = 'queue_average_talk_time',
    QueueInboundCalls = 'queue_inbound_calls',
    QueueOutboundCalls = 'queue_outbound_calls',
    QueueMissedInboundCalls = 'queue_missed_inbound_calls',
}

export enum VoiceAgentsMetric {
    AgentTotalCalls = 'agent_total_calls',
    AgentInboundMissedCalls = 'agent_inbound_missed_calls',
    AgentInboundAnsweredCalls = 'agent_inbound_answered_calls',
    AgentOutboundCalls = 'agent_outbound_calls',
    AgentAverageTalkTime = 'agent_average_talk_time',
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

export type TableColumnSet =
    | AgentsTableColumn
    | ChannelsTableColumns
    | CampaignTableKeys

export type StatsTablesState = {
    [AGENT_PERFORMANCE_SLICE_NAME]: AgentPerformanceState<AgentsTableColumn>
    [AUTO_QA_AGENT_PERFORMANCE_SLICE_NAME]: AgentPerformanceState<AutoQAAgentsTableColumn>
}
