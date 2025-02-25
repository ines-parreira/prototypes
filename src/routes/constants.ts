import { OBJECT_TYPES } from 'custom-fields/constants'

export const CUSTOM_FIELD_ROUTES = {
    [OBJECT_TYPES.CUSTOMER]: 'customer-fields',
    [OBJECT_TYPES.TICKET]: 'ticket-fields',
}

export const CUSTOM_FIELD_CONDITIONS_ROUTE = 'ticket-field-conditions'

export const BASE_STATS_PATH = '/app/stats'

export const STATS_ROUTES = {
    LIVE_OVERVIEW: 'live-overview',
    LIVE_AGENTS: 'live-agents',
    LIVE_VOICE: 'live-voice',
    DASHBOARDS_NEW: 'dashboard/new',
    DASHBOARDS_PAGE: 'dashboard/:id',
    SUPPORT_PERFORMANCE_OVERVIEW: 'support-performance-overview',
    SUPPORT_PERFORMANCE_AGENTS: 'support-performance-agents',
    SUPPORT_PERFORMANCE_BUSIEST_TIMES: 'busiest-times-of-days',
    SUPPORT_PERFORMANCE_CHANNELS: 'channels',
    SUPPORT_PERFORMANCE_SATISFACTION: 'satisfaction',
    SUPPORT_PERFORMANCE_REVENUE: 'revenue',
    SUPPORT_PERFORMANCE_SERVICE_LEVEL_AGREEMENT: 'slas',
    SUPPORT_PERFORMANCE_HELP_CENTER: 'help-center',
    TICKET_INSIGHTS_TICKET_FIELDS: 'ticket-fields',
    TICKET_INSIGHTS_TAGS: 'tags',
    TICKET_INSIGHTS_MACROS: 'macros',
    TICKET_INSIGHTS_INTENTS: 'intents',
    QUALITY_MANAGEMENT_AUTO_QA: 'auto-qa',
    QUALITY_MANAGEMENT_SATISFACTION: 'quality-management-satisfaction',
    CONVERT_CAMPAIGNS: 'convert/campaigns',
    AUTOMATE_AI_AGENTS: 'automate-ai-agent',
    VOICE_OVERVIEW: 'voice-overview',
    VOICE_AGENTS: 'voice-agents',
}
