import { useMemo } from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'

import { useFlag } from 'core/flags'
import { LocaleCode } from 'models/helpCenter/types'
import { useKnowledgeServiceOpportunities } from 'pages/aiAgent/opportunities/hooks/useKnowledgeServiceOpportunities'
import { useHelpCenterAIArticlesLibrary } from 'pages/settings/helpCenter/components/AIArticlesLibraryView/hooks/useHelpCenterAIArticlesLibrary'

import { useShopIntegrationId } from './useShopIntegrationId'

export const useOpportunitiesCount = (
    helpCenterId: number,
    locale: LocaleCode,
    shopName: string | undefined,
) => {
    const useKnowledgeService = useFlag(
        FeatureFlagKey.OpportunitiesMilestone2,
        false,
    )

    const shopIntegrationId = useShopIntegrationId(shopName)

    const { articles: aiArticles, isLoading: isLoadingAiArticles } =
        useHelpCenterAIArticlesLibrary(
            helpCenterId,
            locale,
            shopName ?? null,
            !useKnowledgeService,
        )

    const { isLoading: isLoadingKnowledgeService, totalCount } =
        useKnowledgeServiceOpportunities(shopIntegrationId, useKnowledgeService)

    const opportunitiesCount = useMemo(() => {
        if (!helpCenterId) return 0
        if (useKnowledgeService) {
            return totalCount
        }
        return aiArticles?.length ?? 0
    }, [aiArticles, helpCenterId, useKnowledgeService, totalCount])

    return {
        count: opportunitiesCount,
        isLoading: useKnowledgeService
            ? isLoadingKnowledgeService
            : isLoadingAiArticles,
    }
}
