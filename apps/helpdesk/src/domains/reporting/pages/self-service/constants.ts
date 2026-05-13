export const AUTOMATION_SELF_SERVICE_STAT_NAME = 'automation-self-service'

export const HELP_URL =
    'https://docs.gorgias.com/en-US/articles/automations-279714'

export const PAGE_TITLE_PERFORMANCE_BY_FEATURES = 'Performance by feature'
export const PAGE_TITLE_OVERVIEW = 'Overview'
export const PAGE_TITLE_AI_AGENT = 'AI Agent'
export const PAGE_TITLE_AUTOMATE_PAYWALL = 'AI Agent overview'
export const GORGIAS_AUTOMATE_BADGE = 'GORGIAS AI Agent'

export const ROUTE_OLD_PERFORMANCE_BY_FEATURES = 'automation-add-on-features'
export const ROUTE_AUTOMATE_PERFORMANCE_BY_FEATURES = 'performance-by-features'

export const PAGE_DESCRIPTION =
    'This page provides an overview of the performance of features included in AI Agent. This view shows data from chat and help center channels combined.'

export const FIRST_RESPONSE_TIME_LABEL = 'First response time'
export const RESOLUTION_TIME_LABEL = 'Resolution time'
export const OVERALL_TIME_SAVED_LABEL = 'Overall time saved'
export const AUTOMATION_RATE_LABEL = 'Automation rate'
export const AUTOMATED_INTERACTIONS_LABEL = 'Automated interactions'
export const AUTOMATED_INTERACTIONS_BY_FEATURE_LABEL =
    AUTOMATED_INTERACTIONS_LABEL + ' by feature'

const SHARED_AI_AGENT_NAV_TOOLTIP = {
    videoSrc: 'https://fast.wistia.net/embed/iframe/5agokmbbhz',
    videoPoster:
        'https://embed-ssl.wistia.com/deliveries/9ef6818ab34540e0468b60c7b31d8f52f657ee64.bin',
    videoDuration: '2:00',
    learnMoreUrl: 'https://docs.gorgias.com/en-US/articles/ai-agent-analytics',
}

export const AI_AGENT_AI_AGENT_NAV_TOOLTIP = {
    ...SHARED_AI_AGENT_NAV_TOOLTIP,
    title: 'AI Agent',
    body: 'A deeper look at AI Agent performance, with sub-reports for Support Agent and Shopping Assistant.',
}

export const OVERVIEW_AI_AGENT_NAV_TOOLTIP = {
    ...SHARED_AI_AGENT_NAV_TOOLTIP,
    title: 'Overview',
    body: 'A holistic view of automation performance across your AI Agent and all automation feature usage.',
}
