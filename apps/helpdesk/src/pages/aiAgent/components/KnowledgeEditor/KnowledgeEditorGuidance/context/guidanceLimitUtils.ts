import { VisibilityStatusEnum } from 'models/helpCenter/types'
import { NEW_GUIDANCE_ARTICLE_LIMIT } from 'pages/aiAgent/constants'
import type { FilteredKnowledgeHubArticle } from 'pages/aiAgent/KnowledgeHub/types'

export const calculateGuidanceLimit = (
    guidanceArticles: FilteredKnowledgeHubArticle[],
) => {
    const activeGuidanceCount = (guidanceArticles ?? []).filter(
        (article) => article.visibility === VisibilityStatusEnum.PUBLIC,
    ).length

    const isAtLimit = activeGuidanceCount >= NEW_GUIDANCE_ARTICLE_LIMIT

    const limitMessage = `You've reached the limit of ${NEW_GUIDANCE_ARTICLE_LIMIT} enabled Guidance. Disable Guidance to enable more.`

    return {
        activeGuidanceCount,
        isAtLimit,
        limitMessage,
        limit: NEW_GUIDANCE_ARTICLE_LIMIT,
    }
}
