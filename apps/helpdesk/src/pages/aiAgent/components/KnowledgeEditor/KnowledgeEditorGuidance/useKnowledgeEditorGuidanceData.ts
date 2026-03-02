import { useMemo } from 'react'

import { useAiAgentHelpCenterState } from 'pages/aiAgent/hooks/useAiAgentHelpCenter'
import { useGuidanceArticle } from 'pages/aiAgent/hooks/useGuidanceArticle'
import { useGuidanceArticles } from 'pages/aiAgent/hooks/useGuidanceArticles'
import type { FilteredKnowledgeHubArticle } from 'pages/aiAgent/KnowledgeHub/types'

import type { GuidanceModeType } from './context'

type UseKnowledgeEditorGuidanceDataParams = {
    shopName: string
    guidanceArticleId?: number
    guidanceMode: GuidanceModeType
    isOpen?: boolean
}

export const useKnowledgeEditorGuidanceData = ({
    shopName,
    guidanceArticleId,
    guidanceMode,
    isOpen = true,
}: UseKnowledgeEditorGuidanceDataParams) => {
    const {
        helpCenter: guidanceHelpCenter,
        isLoading: isGuidanceHelpCenterLoading,
    } = useAiAgentHelpCenterState({
        shopName: shopName,
        helpCenterType: 'guidance',
        enabled: isOpen,
    })

    const { guidanceArticles: rawGuidanceArticles } = useGuidanceArticles(
        guidanceHelpCenter?.id ?? 0,
        {
            enabled: isOpen && !!guidanceHelpCenter?.id,
        },
        {
            version_status: 'latest_draft',
        },
    )

    const guidanceArticles = useMemo<FilteredKnowledgeHubArticle[]>(
        () =>
            rawGuidanceArticles.map((article) => ({
                id: article.id,
                title: article.title,
                draftVersionId: article.draftVersionId,
                publishedVersionId: article.publishedVersionId,
                visibility: article.visibility ?? 'UNLISTED',
            })),
        [rawGuidanceArticles],
    )

    const { guidanceArticle, isGuidanceArticleLoading, isError, error } =
        useGuidanceArticle({
            guidanceHelpCenterId: guidanceHelpCenter?.id ?? 0,
            guidanceArticleId: guidanceArticleId ?? 0,
            locale: guidanceHelpCenter?.default_locale ?? 'en-US',
            versionStatus: 'latest_draft',
            enabled:
                isOpen &&
                !!guidanceArticleId &&
                !!guidanceHelpCenter?.id &&
                guidanceMode !== 'create',
        })

    return {
        guidanceHelpCenter,
        isGuidanceHelpCenterLoading,
        guidanceArticles,
        guidanceArticle,
        isGuidanceArticleLoading,
        isError,
        error,
    }
}
