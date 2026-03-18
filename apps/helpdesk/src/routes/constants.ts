import { OBJECT_TYPES } from 'custom-fields/constants'

export const CUSTOM_FIELD_ROUTES = {
    [OBJECT_TYPES.CUSTOMER]: 'customer-fields',
    [OBJECT_TYPES.TICKET]: 'ticket-fields',
}

export const CUSTOM_FIELD_CONDITIONS_ROUTE = 'ticket-field-conditions'

export const BASE_STATS_PATH = '/app/stats'
export const BASE_VOICE_OF_CUSTOMER_PATH = '/app/voice-of-customer'
export const STANDALONE_AI_AGENT_STATS_PATH = '/app/stats/ai-agent'

export const STATS_ROUTES = {
    AI_SALES_AGENT_OVERVIEW: 'ai-sales-agent/overview',
    ANALYTICS_AI_AGENT: 'analytics-ai-agent',
    ANALYTICS_OVERVIEW: 'analytics-overview',
    AUTOMATE_AI_AGENTS: 'automate-ai-agent',
    AUTOMATE_OVERVIEW: 'automate-overview',
    AI_AGENT_OVERVIEW: 'ai-agent-overview',
    AI_AGENT: 'ai-agent',
    CONVERT_CAMPAIGNS: 'convert/campaigns',
    DASHBOARDS_NEW: 'dashboard/new',
    DASHBOARDS_PAGE: 'dashboard/:id',
    LIVE_AGENTS: 'live-agents',
    LIVE_OVERVIEW: 'live-overview',
    LIVE_VOICE: 'live-voice',
    QUALITY_MANAGEMENT_AUTO_QA: 'auto-qa',
    QUALITY_MANAGEMENT_SATISFACTION: 'quality-management-satisfaction',
    SUPPORT_PERFORMANCE_AGENTS: 'support-performance-agents',
    SUPPORT_PERFORMANCE_BUSIEST_TIMES: 'busiest-times-of-days',
    SUPPORT_PERFORMANCE_CHANNELS: 'channels',
    SUPPORT_PERFORMANCE_HELP_CENTER: 'help-center',
    SUPPORT_PERFORMANCE_OVERVIEW: 'support-performance-overview',
    SUPPORT_PERFORMANCE_REVENUE: 'revenue',
    SUPPORT_PERFORMANCE_SATISFACTION: 'satisfaction',
    SUPPORT_PERFORMANCE_SERVICE_LEVEL_AGREEMENT: 'slas',
    TICKET_INSIGHTS_INTENTS: 'intents',
    TICKET_INSIGHTS_MACROS: 'macros',
    TICKET_INSIGHTS_TAGS: 'tags',
    TICKET_INSIGHTS_TICKET_FIELDS: 'ticket-fields',
    VOICE_AGENTS: 'voice-agents',
    VOICE_OVERVIEW: 'voice-overview',
}

export const VOICE_OF_CUSTOMER_ROUTES = {
    PRODUCT_INSIGHTS: 'product-insights',
}
