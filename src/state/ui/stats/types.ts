import { IntentTableColumn } from 'pages/aiAgent/insights/IntentTableWidget/types'
import { CampaignTableKeys } from 'pages/stats/convert/types/enums/CampaignTableKeys.enum'
import { AutoQAAgentsTableColumn } from 'pages/stats/support-performance/auto-qa/AutoQAAgentsTableConfig'
import { AgentPerformanceState } from 'state/ui/stats/agentPerformanceSlice'
import {
    AGENT_PERFORMANCE_SLICE_NAME,
    AUTO_QA_AGENT_PERFORMANCE_SLICE_NAME,
    INTENT_SLICE_NAME,
} from 'state/ui/stats/constants'
import { IntentState } from 'state/ui/stats/insightsSlice'

export enum AgentsTableColumn {
    AgentName = 'agent_name',
    CustomerSatisfaction = 'agent_customer_satisfaction',
    MedianFirstResponseTime = 'agent_median_first_response_time',
    AverageResponseTime = 'agent_average_response_time',
    MedianResolutionTime = 'agent_median_resolution_time',
    MessagesSent = 'agent_messages_sent',
    MessagesReceived = 'agent_messages_received',
    PercentageOfClosedTickets = 'agent_percentage_of_closed_tickets',
    ClosedTickets = 'agent_closed_tickets',
    RepliedTickets = 'agent_replied_tickets',
    OneTouchTickets = 'agent_one_touch_tickets',
    ZeroTouchTickets = 'agent_zero_touch_tickets',
    OnlineTime = 'agent_online_time',
    MessagesSentPerHour = 'agent_messages_sent_per_hour',
    RepliedTicketsPerHour = 'agent_replied_tickets_per_hour',
    ClosedTicketsPerHour = 'agent_closed_tickets_per_hour',
    TicketHandleTime = 'agent_ticket_handle_time',
}

export enum AgentsTableRow {
    Average = 'average',
    Total = 'total',
}

export enum AutoQAMetric {
    ReviewedClosedTickets = 'auto_qa_reviewed_closed_tickets',
    ResolutionCompleteness = 'auto_qa_resolution_completeness',
    CommunicationSkills = 'auto_qa_communication_skills',
    LanguageProficiency = 'auto_qa_language_proficiency',
    Accuracy = 'auto_qa_accuracy',
    Efficiency = 'auto_qa_efficiency',
    InternalCompliance = 'auto_qa_internal_compliance',
    BrandVoice = 'auto_qa_brand_voice',
}

export enum SatisfactionMetric {
    ResponseRate = 'satisfaction_survey_response_rate',
    SatisfactionScore = 'satisfaction_survey_satisfaction_score',
    SurveysSent = 'satisfaction_survey_surveys_sent',
    AverageSurveyScore = 'satisfaction_average_survey_score',
    AverageCSATPerChannel = 'satisfaction_average_csat_per_channel',
    AverageCSATPerAssignee = 'satisfaction_average_csat_per_assignee',
    AverageCSATPerIntegration = 'satisfaction_average_csat_per_integration',
}

export enum SatisfactionAverageSurveyScoreMetric {
    AverageSurveyScoreOne = 'satisfaction_average_survey_score_1',
    AverageSurveyScoreTwo = 'satisfaction_average_survey_score_2',
    AverageSurveyScoreThree = 'satisfaction_average_survey_score_3',
    AverageSurveyScoreFour = 'satisfaction_average_survey_score_4',
    AverageSurveyScoreFive = 'satisfaction_average_survey_score_5',
}

export enum TicketFieldsMetric {
    TicketCustomFieldsTicketCount = 'ticket_custom_fields_ticket_count',
}

export enum AIInsightsMetric {
    TicketCustomFieldsTicketCount = 'ai_agent_insights_ticket_custom_fields_ticket_count',
    TicketDrillDownPerCoverageRate = 'ai_agent_insights_ticket_drill_down_per_coverage_rate',
    TicketDrillDownPerCustomerSatisfaction = 'ai_agent_insights_ticket_drill_down_per_customer_satisfaction',
}

export enum TagsMetric {
    TicketCount = 'ticket_tags_fields_ticket_count',
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
    DEPRECATED_QueueMissedInboundCalls = 'queue_missed_inbound_calls',
    QueueInboundUnansweredCalls = 'queue_inbound_unanswered_calls',
    QueueInboundMissedCalls = 'queue_inbound_missed_calls',
    QueueInboundAbandonedCalls = 'queue_inbound_abandoned_calls',
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

export type TableViewItem<T> = {
    id: T
    visibility: boolean | null
}

export type TableView<T, R> = {
    id: string
    name: string
    metrics: TableViewItem<T>[]
    rows?: TableViewItem<R>[]
}

export type TableSetting<T, R = never> = {
    active_view: string
    views: TableView<T, R>[]
}

export enum ChannelsTableColumns {
    Channel = 'channels_channel',
    TicketsCreated = 'channels_tickets_created',
    CreatedTicketsPercentage = 'channels_created_tickets_as_percentage',
    ClosedTickets = 'channels_closed_tickets',
    TicketHandleTime = 'channels_ticket_handle_time',
    FirstResponseTime = 'channels_first_response_time',
    MedianResolutionTime = 'channels_median_resolution_time',
    TicketsReplied = 'channels_tickets_replied',
    MessagesSent = 'channels_messages_sent',
    MessagesReceived = 'channels_messages_received',
    CustomerSatisfaction = 'channels_customer_satisfaction',
}

export type TableColumnSet =
    | AgentsTableColumn
    | ChannelsTableColumns
    | CampaignTableKeys
    | IntentTableColumn

export type TableRowSet = AgentsTableRow

export type StatsTablesState = {
    [AGENT_PERFORMANCE_SLICE_NAME]: AgentPerformanceState<AgentsTableColumn>
    [AUTO_QA_AGENT_PERFORMANCE_SLICE_NAME]: AgentPerformanceState<AutoQAAgentsTableColumn>
    [INTENT_SLICE_NAME]: IntentState<IntentTableColumn>
}

export enum ValueMode {
    TotalCount = 'totalCount',
    Percentage = 'percentage',
}

export enum CsatSentiment {
    Positive = 'positive',
    Negative = 'negative',
}
