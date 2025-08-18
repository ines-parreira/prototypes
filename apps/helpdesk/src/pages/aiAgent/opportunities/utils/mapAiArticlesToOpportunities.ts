import { AILibraryArticleItem } from 'models/helpCenter/types'

import { OpportunityType } from '../enums'

export interface Opportunity {
    id: string
    title: string
    content: string
    type: OpportunityType
}

export const mapAiArticlesToOpportunities = (
    aiArticles: AILibraryArticleItem[],
): Opportunity[] => {
    return aiArticles.map((article) => ({
        id: article.key,
        title: article.title,
        content: article.html_content,
        type: OpportunityType.FILL_KNOWLEDGE_GAP,
    }))
}
