import {Action, Guidance, Knowledge} from 'models/aiAgentFeedback/types'

export const getKnowledgeUrl = (knowledge: Knowledge) => {
    switch (knowledge.type) {
        case 'article':
        case 'external_snippet':
            return knowledge.url
        case 'macro':
            return `/app/settings/macros/${knowledge.id}`
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
    return `/app/automation/${shopType}/${shopName}/actions/${action.id}`
}

export const mapResourceLabelToType = (label: string) => {
    switch (label) {
        case 'Guidance':
            return 'guidance'
        case 'Help Center articles':
            return 'article'
        case 'External websites':
            return 'external_snippet'
        case 'Macros':
            return 'macro'
        default:
        case 'Actions':
            return 'action'
    }
}
