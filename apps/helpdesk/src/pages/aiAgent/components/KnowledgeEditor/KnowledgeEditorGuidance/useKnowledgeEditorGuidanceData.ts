import { useMemo } from 'react'

import { useGetArticleTranslationVersion } from 'models/helpCenter/queries'
import { VisibilityStatusEnum } from 'models/helpCenter/types'
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
    initialVersionId?: number
}

export const useKnowledgeEditorGuidanceData = ({
    shopName,
    guidanceArticleId,
    guidanceMode,
    isOpen = true,
    initialVersionId,
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
                visibility: article.visibility ?? VisibilityStatusEnum.UNLISTED,
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

    const {
        data: initialVersionData,
        isLoading: isVersionQueryLoading,
        isError: isInitialVersionError,
    } = useGetArticleTranslationVersion(
        {
            help_center_id: guidanceHelpCenter?.id ?? 0,
            article_id: guidanceArticle?.id ?? 0,
            locale: guidanceHelpCenter?.default_locale ?? 'en-US',
            version_id: initialVersionId ?? 0,
        },
        {
            enabled:
                !!initialVersionId &&
                !!guidanceHelpCenter?.id &&
                !!guidanceArticle,
            staleTime: 10 * 60 * 1000,
            refetchOnWindowFocus: false,
        },
    )

    const isCurrentVersion =
        !!initialVersionData &&
        (guidanceArticle?.publishedVersionId === initialVersionData.id ||
            guidanceArticle?.draftVersionId === initialVersionData.id)

    return {
        guidanceHelpCenter,
        isGuidanceHelpCenterLoading,
        guidanceArticles,
        guidanceArticle,
        isGuidanceArticleLoading,
        isError,
        error,
        initialVersionData: isCurrentVersion ? undefined : initialVersionData,
        isInitialVersionLoading: !!initialVersionId && isVersionQueryLoading,
        isInitialVersionError,
    }
}
