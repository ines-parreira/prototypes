import { AiAgentKnowledgeResourceTypeEnum } from '../AIAgentFeedbackBar/types'

export const coerceResourceType = (parts: string[]) => {
    const [resourceType, ...additionalParts] = parts

    switch (resourceType) {
        case 'action_execution':
            return AiAgentKnowledgeResourceTypeEnum.ACTION
        case 'product':
            const subType = additionalParts[1]
            if (subType === 'knowledge') {
                return AiAgentKnowledgeResourceTypeEnum.PRODUCT_KNOWLEDGE
            }
            if (subType === 'recommendation') {
                return AiAgentKnowledgeResourceTypeEnum.PRODUCT_RECOMMENDATION
            }
            return AiAgentKnowledgeResourceTypeEnum.PRODUCT_KNOWLEDGE
        default:
            return resourceType.toUpperCase() as AiAgentKnowledgeResourceTypeEnum
    }
}
