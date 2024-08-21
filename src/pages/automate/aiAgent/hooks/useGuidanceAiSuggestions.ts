import {useCallback, useMemo} from 'react'
import {useQueryClient} from '@tanstack/react-query'
import {getValidStoreIntegrationId} from 'pages/settings/helpCenter/utils/helpCenter.utils'
import {
    aiGeneratedGuidanceKeys,
    useGetAIGeneratedGuidances,
} from 'models/aiAgent/queries'
import useAppSelector from 'hooks/useAppSelector'
import {getStoreIntegrations} from 'state/integrations/selectors'
import {mapAIGuidanceDTOToAIGuidance} from '../utils/guidance.utils'
import {useGuidanceArticles} from './useGuidanceArticles'

type Props = {
    helpCenterId: number
    shopName: string
}

export const useGuidanceAiSuggestions = ({helpCenterId, shopName}: Props) => {
    const queryClient = useQueryClient()

    const {
        guidanceArticles,
        isGuidanceArticleListLoading: isLoadingGuidanceArticleList,
    } = useGuidanceArticles(helpCenterId)

    const allStoreIntegrations = useAppSelector(getStoreIntegrations)
    const storeIntegrationId = getValidStoreIntegrationId(
        allStoreIntegrations,
        shopName
    )

    const invalidateAiGuidances = async () => {
        await queryClient.invalidateQueries({
            queryKey: aiGeneratedGuidanceKeys.listWithStore(
                helpCenterId,
                storeIntegrationId
            ),
        })
    }

    const {data, isLoading: isLoadingAiGuidances} = useGetAIGeneratedGuidances(
        helpCenterId,
        storeIntegrationId,
        {retry: false, refetchOnWindowFocus: false}
    )

    const aiGuidances = useMemo(() => {
        if (!data || !storeIntegrationId) {
            return []
        }
        return data
            .filter((aiGuidance) => aiGuidance.review_action !== 'created')
            .map((aiGuidance) => mapAIGuidanceDTOToAIGuidance(aiGuidance))
            .sort((a, b) => a.name.localeCompare(b.name))
    }, [data, storeIntegrationId])

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
        isLoadingAiGuidances,
        isLoadingGuidanceArticleList,
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
        invalidateAiGuidances,
    }
}
