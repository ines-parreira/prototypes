import { AILibraryArticleItem } from 'models/helpCenter/types'

import { OpportunityType } from '../enums'

export interface Opportunity {
    id: string
    key: string
    title: string
    content: string
    type: OpportunityType
    ticketCount?: number
    detectionObjectIds?: string[]
}

const removeAiPrefix = (key: string): string => {
    return key.startsWith('ai_') ? key.slice(3) : key
}

export const mapAiArticlesToOpportunities = (
    aiArticles: AILibraryArticleItem[],
): Opportunity[] => {
    return aiArticles.map(
        (article): Opportunity => ({
            id: removeAiPrefix(article.key),
            key: article.key,
            title: article.title,
            content: article.html_content,
            type: OpportunityType.FILL_KNOWLEDGE_GAP,
        }),
    )
}
