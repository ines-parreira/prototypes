import { TooltipData } from 'domains/reporting/pages/types'

export const DECREASE_IN_RESOLUTION_TIME = 'Decrease in resolution time'
export const AUTOMATION_RATE_LABEL = 'Automation rate'
export const AUTOMATED_INTERACTIONS_LABEL = 'Automated interactions'
export const OVERALL_AUTOMATION_RATE_LABEL = 'Overall automation rate'
export const OVERALL_AUTOMATED_INTERACTIONS_LABEL =
    'Overall automated interactions'
export const DECREASE_IN_FIRST_RESPONSE = 'Decrease in first response time'
export const TIME_SAVED_BY_AGENTS = 'Overall time saved by agents'
export const COST_SAVED = 'Cost saved'
export const AI_AGENT_AUTOMATION_RATE_LABEL = 'AI Agent automation rate'
export const AI_AGENT_AUTOMATED_INTERACTIONS_COUNT_LABEL =
    'AI Agent automated interactions'

export const AGENT_COST_PER_TICKET = 3.1

// Below values are from https://app.periscopedata.com/app/gorgias/1123203/[Cross]-Automation-Add-on-Performance?widget=17138886&udv=0
export const AUTOMATION_RATE_FIXED_STATS = {
    top10P: 0.48,
    avg: 0.14,
}

export const AUTOMATED_INTERACTION_TOOLTIP: TooltipData = {
    title: 'Fully automated interactions solved without any agent intervention.',
    link: 'https://link.gorgias.com/ppw',
    linkText: 'How is it calculated?',
}

export const AI_AGENT_AUTOMATION_RATE_TOOLTIP: TooltipData = {
    title: 'Interactions automated by AI Agent as a percent of all customer interactions.',
}

export const AI_AGENT_AUTOMATED_INTERACTIONS_TOOLTIP: TooltipData = {
    title: 'Interactions fully resolved by AI Agent without human intervention.',
}
