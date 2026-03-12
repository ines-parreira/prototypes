import type { CampaignTableKeys } from 'domains/reporting/pages/convert/types/enums/CampaignTableKeys.enum'
import type { AgentAvailabilityColumn } from 'domains/reporting/pages/support-performance/agents/AgentAvailabilityTableConfig'
import type { AutoQAAgentsTableColumn } from 'domains/reporting/pages/support-performance/auto-qa/AutoQAAgentsTableConfig'
import type { AgentPerformanceState } from 'domains/reporting/state/ui/stats/agentPerformanceSlice'
import type {
    AGENT_AVAILABILITY_SLICE_NAME,
    AGENT_PERFORMANCE_SLICE_NAME,
    AUTO_QA_AGENT_PERFORMANCE_SLICE_NAME,
    INTENT_SLICE_NAME,
    PRODUCT_INSIGHTS_SLICE_NAME,
    PRODUCTS_PER_TICKET_SLICE_NAME,
    VOICE_AGENTS_PERFORMANCE_SLICE_NAME,
} from 'domains/reporting/state/ui/stats/constants'
import type { createTableSlice } from 'domains/reporting/state/ui/stats/createTableSlice'
import type { IntentState } from 'domains/reporting/state/ui/stats/insightsSlice'
import type { ProductInsightsSliceState } from 'domains/reporting/state/ui/stats/productInsightsSlice'
import type { ProductsPerTicketState } from 'domains/reporting/state/ui/stats/productsPerTicketSlice'
import type { OrderDirection } from 'models/api/types'
import type { IntentTableColumn } from 'pages/aiAgent/insights/IntentTableWidget/types'

export enum AgentsTableColumn {
    AgentName = 'agent_name',
    CustomerSatisfaction = 'agent_customer_satisfaction',
    MedianFirstResponseTime = 'agent_median_first_response_time',
    HumanResponseTimeAfterAiHandoff = 'agent_human_response_time_after_ai_handoff',
    MedianResponseTime = 'agent_median_response_time',
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

export type AgentAvailabilityTableColumn = AgentAvailabilityColumn

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

export enum VoiceSlaMetric {
    VoiceCallsAchievementRate = 'voice-calls-sla-achievement-rate',
    VoiceCallsBreachedRate = 'voice-calls-sla-breached-rate',
}

export enum KnowledgeMetric {
    Tickets = 'knowledge_tickets',
    HandoverTickets = 'knowledge_handover',
    CSAT = 'knowledge_csat',
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
    QueueInboundUnansweredCalls = 'queue_inbound_unanswered_calls',
    QueueInboundMissedCalls = 'queue_inbound_missed_calls',
    QueueInboundAbandonedCalls = 'queue_inbound_abandoned_calls',
    QueueInboundCancelledCalls = 'queue_inbound_cancelled_calls',
    QueueInboundCallbackRequestedCalls = 'queue_inbound_callback_requested_calls',
    QueueCallsAchievementRate = 'queue-calls-sla-achievement-rate',
    VoiceCallsAchievementRate = 'voice-calls-sla-achievement-rate',
    VoiceCallsBreachedRate = 'voice-calls-sla-breached-rate',
}

export enum VoiceAgentsMetric {
    AgentTotalCalls = 'agent_total_calls',
    AgentInboundMissedCalls = 'agent_inbound_missed_calls',
    AgentInboundAnsweredCalls = 'agent_inbound_answered_calls',
    AgentInboundTransferredCalls = 'agent_inbound_transferred_calls',
    AgentInboundDeclinedCalls = 'agent_inbound_declined_calls',
    AgentOutboundCalls = 'agent_outbound_calls',
    AgentAverageTalkTime = 'agent_average_talk_time',
}

export enum VoiceAgentsTableColumn {
    AgentName = 'agent_name',
    TotalCalls = 'total_calls',
    InboundMissedCalls = 'inbound_missed_calls',
    InboundTransferredCalls = 'inbound_transferred_calls',
    InboundAnsweredCalls = 'inbound_answered_calls',
    InboundDeclinedCalls = 'inbound_declined_calls',
    OutboundCalls = 'agent_outbound_calls',
    AverageTalkTime = 'agent_average_talk_time',
}

export enum AgentsTableViewIdentifier {
    AgentPerformanceMetrics = 'agent_performance_metrics',
}

export enum ChannelsTableViewIdentifier {
    ChannelsReport = 'channelsReport',
}

export enum ProductInsightsTableViewIdentifier {
    ProductInsights = 'productInsights',
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
    MedianResponseTime = 'channels_median_response_time',
    HumanResponseTimeAfterAiHandoff = 'channels_human_response_time_after_ai_handoff',
}

export enum ProductInsightsTableColumns {
    Product = 'product_insights_product',
    Feedback = 'product_insights_feedback',
    NegativeSentiment = 'product_insights_negative_sentiment',
    NegativeSentimentDelta = 'product_insights_negative_sentiment_delta',
    PositiveSentiment = 'product_insights_positive_sentiment',
    PositiveSentimentDelta = 'product_insights_positive_sentiment_delta',
    ReturnMentions = 'product_insights_return_mentions',
    TicketsVolume = 'product_insights_tickets_volume',
}

export type TableColumnSet =
    | AgentsTableColumn
    | ChannelsTableColumns
    | CampaignTableKeys
    | IntentTableColumn
    | ProductInsightsTableColumns
    | AgentAvailabilityColumn

export type TableRowSet = AgentsTableRow

export type StatsTablesState = {
    [AGENT_PERFORMANCE_SLICE_NAME]: AgentPerformanceState<AgentsTableColumn>
    [AGENT_AVAILABILITY_SLICE_NAME]: AgentPerformanceState<AgentAvailabilityColumn>
    [AUTO_QA_AGENT_PERFORMANCE_SLICE_NAME]: AgentPerformanceState<AutoQAAgentsTableColumn>
    [INTENT_SLICE_NAME]: IntentState<IntentTableColumn>
    [PRODUCTS_PER_TICKET_SLICE_NAME]: ProductsPerTicketState
    [VOICE_AGENTS_PERFORMANCE_SLICE_NAME]: AgentPerformanceState<VoiceAgentsTableColumn>
    [PRODUCT_INSIGHTS_SLICE_NAME]: ProductInsightsSliceState
}

export type TableSlice<
    Columns extends AgentsTableColumn | VoiceAgentsTableColumn,
> = ReturnType<typeof createTableSlice<Columns>>

export enum ValueMode {
    TotalCount = 'totalCount',
    Percentage = 'percentage',
}

export enum CsatSentiment {
    Positive = 'positive',
    Negative = 'negative',
}

export type ColumnSorting<Column> = {
    field: Column
    direction: OrderDirection
}
