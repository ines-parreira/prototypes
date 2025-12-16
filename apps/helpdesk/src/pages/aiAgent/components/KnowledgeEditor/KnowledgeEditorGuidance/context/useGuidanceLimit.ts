import { useMemo } from 'react'

import type { FilteredKnowledgeHubArticle } from 'pages/aiAgent/KnowledgeHub/types'

import { calculateGuidanceLimit } from './guidanceLimitUtils'

export const useGuidanceLimit = (
    guidanceArticles: FilteredKnowledgeHubArticle[],
) => {
    return useMemo(
        () => calculateGuidanceLimit(guidanceArticles),
        [guidanceArticles],
    )
}
