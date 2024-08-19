import {useCallback, useMemo} from 'react'
import {IntegrationType} from 'models/integration/constants'
import useShopifyIntegrations from 'pages/automate/common/hooks/useShopifyIntegrations'
import useSelfServiceStoreIntegration from 'pages/automate/common/hooks/useSelfServiceStoreIntegration'
import {getValidStoreIntegrationId} from 'pages/settings/helpCenter/utils/helpCenter.utils'
import {useGetAIGeneratedGuidances} from 'models/aiAgent/queries'
import {mapAIGuidanceDTOToAIGuidance} from '../utils/guidance.utils'
import {useGuidanceArticles} from './useGuidanceArticles'

type Props = {
    helpCenterId: number
    shopName: string
}

export const useGuidanceAiSuggestions = ({helpCenterId, shopName}: Props) => {
    const {guidanceArticles, isGuidanceArticleListLoading} =
        useGuidanceArticles(helpCenterId)

    const shopifyIntegrations = useShopifyIntegrations()
    const storeIntegration = useSelfServiceStoreIntegration(
        IntegrationType.Shopify,
        shopName
    )
    const storeIntegrationId = getValidStoreIntegrationId(
        shopifyIntegrations,
        storeIntegration
    )

    const {data, isLoading: isLoadingAIGuidances} = useGetAIGeneratedGuidances(
        helpCenterId,
        storeIntegrationId
    )

    const isLoading = isGuidanceArticleListLoading || isLoadingAIGuidances

    const aiGuidances = useMemo(() => {
        if (
            !data ||
            !shopifyIntegrations ||
            !storeIntegration ||
            !storeIntegrationId
        ) {
            return []
        }
        return data
            .filter((aiGuidance) => aiGuidance.review_action !== 'created')
            .map((aiGuidance) => mapAIGuidanceDTOToAIGuidance(aiGuidance))
    }, [data, shopifyIntegrations, storeIntegration, storeIntegrationId])

    const isAllAIGuidancesUsed =
        data && data.length > 0 && aiGuidances.length === 0

    const hasAIGuidancesFromAPI = !!data && data.length > 0

    const getAiGuidanceById = useCallback(
        (aiGuidanceId: string) => {
            if (!data || !aiGuidanceId) {
                return null
            }
            const aiGuidanceSuggestion = data.find(
                (aiGuidance) => aiGuidance.key === aiGuidanceId
            )
            return aiGuidanceSuggestion
                ? mapAIGuidanceDTOToAIGuidance(aiGuidanceSuggestion)
                : null
        },
        [data]
    )

    return {
        guidanceArticles,
        isLoading,
        guidanceAISuggestions: aiGuidances,
        isAllAIGuidancesUsed,
        isEmptyStateNoAIGuidances:
            !hasAIGuidancesFromAPI && guidanceArticles.length === 0,
        isEmptyStateAIGuidances:
            aiGuidances.length > 0 && guidanceArticles.length === 0,
        isGuidancesOnly: !hasAIGuidancesFromAPI && guidanceArticles.length > 0,
        isGuidancesAndAIGuidances:
            hasAIGuidancesFromAPI && guidanceArticles.length > 0,
        getAiGuidanceById,
    }
}
