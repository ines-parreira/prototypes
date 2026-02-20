import type { AILibraryArticleItem } from 'models/helpCenter/types'

import { OpportunityType } from '../enums'
import type { Opportunity } from '../types'
import { ResourceType } from '../types'
import { capitalizeFirstLetter } from './capitalizeFirstLetter'

const removeAiPrefix = (key: string): string => {
    return key.startsWith('ai_') ? key.slice(3) : key
}

/**
 * Maps AI articles to full Opportunity objects for the legacy flow.
 * In legacy flow, the same data is used for both sidebar and content display.
 */
export const mapAiArticlesToOpportunities = (
    aiArticles: AILibraryArticleItem[],
): Opportunity[] => {
    return aiArticles.map(
        (article): Opportunity => ({
            id: removeAiPrefix(article.key),
            key: article.key,
            type: OpportunityType.FILL_KNOWLEDGE_GAP,
            insight: capitalizeFirstLetter(article.title),
            resources: [
                {
                    title: article.title,
                    content: article.html_content,
                    type: ResourceType.GUIDANCE,
                    isVisible: true,
                },
            ],
        }),
    )
}
