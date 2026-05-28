export enum AiAgentAnalyticsContent {
    AllAgents = 'All Agents',
    SupportAgent = 'Support Agent',
    ShoppingAssistant = 'Shopping Assistant',
}

export enum AiAgentAnalyticsQueryParams {
    AllAgents = 'all-agents',
    SupportAgent = 'support-agent',
    ShoppingAssistant = 'shopping-assistant',
}

export const MIN_DATE_FOR_AI_AGENT = '2024-08-01'

export const DISMISSED_FILTERING_MESSAGE_BANNER =
    'ai-agent-analytics-data-delay-banner-dismissed'
export const DATA_FILTERING_WARNING_MESSAGE =
    'Data for the past 72 hours is not included on this dashboard, as interactions are considered automated after 72 hours have passed without a customer reply.'
