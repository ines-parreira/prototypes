import {Action, Guidance, Knowledge} from 'models/aiAgentFeedback/types'
import {TicketMessage} from 'models/ticket/types'

import {TRIAL_MESSAGE_TAG} from './constants'

export const getKnowledgeUrl = (
    knowledge: Knowledge,
    shopType: string,
    shopName: string
) => {
    switch (knowledge.type) {
        case 'article':
        case 'external_snippet':
            return knowledge.url
        case 'file_external_snippet':
            return `/app/automation/${shopType}/${shopName}/ai-agent/knowledge`
        case 'macro':
            return `/app/settings/macros/${knowledge.id}/edit`
        default:
            return ''
    }
}

export const getGuidanceUrl = (
    guidance: Guidance,
    shopType: string,
    shopName: string
) => {
    return `/app/automation/${shopType}/${shopName}/ai-agent/guidance/${guidance.id}`
}

export const getActionUrl = (
    action: Action,
    shopType: string,
    shopName: string
) => {
    return `/app/automation/${shopType}/${shopName}/ai-agent/actions/edit/${action.id}`
}

export const mapResourceLabelToType = (label: string) => {
    switch (label) {
        case 'Guidance':
            return 'guidance'
        case 'Help Center articles':
            return 'article'
        case 'External websites':
            return 'external_snippet'
        case 'External files':
            return 'file_external_snippet'
        case 'Macros':
            return 'macro'
        case 'Hard action':
            return 'hard_action'
        // Special case for options at level 0, without a resource group
        case undefined:
            return 'other'
        case 'Soft action':
        default:
            return 'soft_action'
    }
}

export const isTrialMessageFromAIAgent = (message: TicketMessage) => {
    return !!(
        message?.body_html &&
        message?.body_html.indexOf(TRIAL_MESSAGE_TAG) !== -1
    )
}
