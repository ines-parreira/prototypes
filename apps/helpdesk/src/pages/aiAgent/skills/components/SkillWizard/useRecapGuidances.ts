import { useCallback, useMemo } from 'react'

import { useGuidanceArticles } from 'pages/aiAgent/hooks/useGuidanceArticles'
import { useAiAgentStoreConfigurationContext } from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'

export type RecapGuidance = {
    id: number
    title: string
}

/**
 * Fetches the guidance articles referenced by `guidanceIds`. Uses the
 * `ListArticles` `ids` query parameter so we don't depend on pagination —
 * any guidance the wizard's recommendations point at will land in the
 * single response, regardless of total help-center size.
 */
export const useRecapGuidances = (guidanceIds: readonly number[]) => {
    const { storeConfiguration } = useAiAgentStoreConfigurationContext()
    const guidanceHelpCenterId = storeConfiguration?.guidanceHelpCenterId ?? 0

    const dedupedIds = useMemo(
        () => Array.from(new Set(guidanceIds)).sort((a, b) => a - b),
        [guidanceIds],
    )

    const { guidanceArticles, isGuidanceArticleListLoading } =
        useGuidanceArticles(
            guidanceHelpCenterId,
            { enabled: !!guidanceHelpCenterId && dedupedIds.length > 0 },
            { ids: dedupedIds, per_page: dedupedIds.length || 1 },
        )

    const guidanceById = useMemo(() => {
        const map = new Map<number, RecapGuidance>()
        for (const article of guidanceArticles) {
            map.set(article.id, { id: article.id, title: article.title })
        }
        return map
    }, [guidanceArticles])

    const getGuidanceTitle = useCallback(
        (guidanceId: number): string =>
            guidanceById.get(guidanceId)?.title ?? `Guidance ${guidanceId}`,
        [guidanceById],
    )

    return {
        guidanceById,
        getGuidanceTitle,
        isLoading: isGuidanceArticleListLoading,
    }
}
