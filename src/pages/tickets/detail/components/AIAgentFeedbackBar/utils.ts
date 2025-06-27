import { StoreConfiguration } from 'models/aiAgent/types'
import { Action, Guidance, Knowledge } from 'models/aiAgentFeedback/types'
import { TicketMessage } from 'models/ticket/types'
import { getAiAgentNavigationRoutes } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import { AiAgentKnowledgeResourceTypeEnum } from 'pages/tickets/detail/components/AIAgentFeedbackBar/types'
import { getLDClient } from 'utils/launchDarkly'

import { TRIAL_MESSAGE_TAG } from './constants'

export const getKnowledgeUrl = (
    knowledge: Knowledge,
    shopType: string,
    shopName: string,
) => {
    switch (knowledge.type) {
        case 'article':
        case 'external_snippet':
            return knowledge.url
        case 'file_external_snippet': {
            const flags = getLDClient().allFlags()
            const aiAgentRoutes = getAiAgentNavigationRoutes(shopName, flags)
            return aiAgentRoutes.knowledge
        }
        case 'macro':
            return `/app/settings/macros/${knowledge.id}`
        default:
            return ''
    }
}

export const getGuidanceUrl = (
    guidance: Guidance,
    shopType: string,
    shopName: string,
) => {
    const flags = getLDClient().allFlags()
    const aiAgentRoutes = getAiAgentNavigationRoutes(shopName, flags)
    return aiAgentRoutes.guidanceArticleEdit(guidance.id)
}

export const getActionUrl = (
    action: Action,
    shopType: string,
    shopName: string,
) => {
    const flags = getLDClient().allFlags()
    const aiAgentRoutes = getAiAgentNavigationRoutes(shopName, flags)
    return aiAgentRoutes.editAction(String(action.id))
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

export const mapToKnowledgeSourceType = (
    type: AiAgentKnowledgeResourceTypeEnum,
) => {
    switch (type) {
        case AiAgentKnowledgeResourceTypeEnum.ARTICLE:
            return 'article'
        case AiAgentKnowledgeResourceTypeEnum.ACTION:
            return 'action'
        case AiAgentKnowledgeResourceTypeEnum.GUIDANCE:
            return 'guidance'
        case AiAgentKnowledgeResourceTypeEnum.MACRO:
            return 'macro'
        case AiAgentKnowledgeResourceTypeEnum.FILE_EXTERNAL_SNIPPET:
            return 'external_snippet'
        case AiAgentKnowledgeResourceTypeEnum.EXTERNAL_SNIPPET:
            return 'link'
        case AiAgentKnowledgeResourceTypeEnum.STORE_WEBSITE_QUESTION_SNIPPET:
            return 'website'
        case AiAgentKnowledgeResourceTypeEnum.ORDER:
            return 'order'
        default:
            return 'article'
    }
}

export const knowledgeResourceShouldBeLink = (
    type: AiAgentKnowledgeResourceTypeEnum,
) =>
    ![
        AiAgentKnowledgeResourceTypeEnum.ARTICLE,
        AiAgentKnowledgeResourceTypeEnum.GUIDANCE,
    ].includes(type)

export function getKnowledgeResourceTypeLabel(
    type?: AiAgentKnowledgeResourceTypeEnum,
): string {
    switch (type) {
        case AiAgentKnowledgeResourceTypeEnum.GUIDANCE:
            return 'Guidance'
        case AiAgentKnowledgeResourceTypeEnum.ARTICLE:
            return 'Help Center article'
        default:
            return ''
    }
}

export function getHelpCenterIdByResourceType(
    storeConfiguration?: StoreConfiguration,
    type?: AiAgentKnowledgeResourceTypeEnum,
) {
    switch (type) {
        case AiAgentKnowledgeResourceTypeEnum.GUIDANCE:
            return storeConfiguration?.guidanceHelpCenterId
        case AiAgentKnowledgeResourceTypeEnum.ARTICLE:
            return storeConfiguration?.helpCenterId
                ? storeConfiguration.helpCenterId
                : undefined
        default:
            return
    }
}
