import {Action, Guidance, Knowledge} from 'models/aiAgentFeedback/types'

export const getKnowledgeUrl = (
    knowledge: Knowledge,
    shopType: string,
    shopName: string
) => {
    switch (knowledge.type) {
        case 'article':
        case 'external_snippet':
            return knowledge.url
        case 'macro':
            return `/app/settings/macros/${knowledge.id}`
        case 'flow':
            return `/app/automation/${shopType}/${shopName}/flows/edit/${knowledge.id}`
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
