import { useMemo } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { useQueryClient } from '@tanstack/react-query'

import useAppSelector from 'hooks/useAppSelector'
import {
    aiGeneratedGuidanceKeys,
    useGetAIGeneratedGuidances,
} from 'models/aiAgent/queries'
import { getValidStoreIntegrationId } from 'pages/settings/helpCenter/utils/helpCenter.utils'
import { getStoreIntegrations } from 'state/integrations/selectors'

import type { GuidanceArticle } from '../types'
import { mapAIGuidanceDTOToAIGuidance } from '../utils/guidance.utils'
import {
    getGuidanceArticleQueryParams,
    useGuidanceArticles,
} from './useGuidanceArticles'

type Props = {
    helpCenterId: number
    shopName: string
    query?: string
}

export const useGuidanceAiSuggestions = ({
    helpCenterId,
    shopName,
    query,
}: Props) => {
    const queryClient = useQueryClient()

    const isIncreaseGuidanceCreationLimit = useFlag(
        FeatureFlagKey.IncreaseGuidanceCreationLimit,
    )
    const queryParamsBase = {
        ...getGuidanceArticleQueryParams(isIncreaseGuidanceCreationLimit),
    }

    const {
        guidanceArticles: titleGuidanceArticles,
        isGuidanceArticleListLoading: isLoadingTitleGuidanceArticles,
    } = useGuidanceArticles(helpCenterId, undefined, {
        ...queryParamsBase,
        ...(query && { title: query }),
    })

    const {
        guidanceArticles: contentGuidanceArticles,
        isGuidanceArticleListLoading: isLoadingContentGuidanceArticles,
    } = useGuidanceArticles(
        helpCenterId,
        {
            enabled: !!query,
        },
        {
            ...queryParamsBase,
            ...(query && { content: query }),
        },
    )

    const isLoadingGuidanceArticleList =
        isLoadingTitleGuidanceArticles || isLoadingContentGuidanceArticles

    const guidanceArticles = useMemo(() => {
        const articlesMap = [
            ...(titleGuidanceArticles || []),
            ...(contentGuidanceArticles || []),
        ].reduce((map, article) => {
            map.set(article.id, article)
            return map
        }, new Map<number, GuidanceArticle>())

        return Array.from(articlesMap.values())
    }, [titleGuidanceArticles, contentGuidanceArticles])

    const allStoreIntegrations = useAppSelector(getStoreIntegrations)
    const storeIntegrationId = getValidStoreIntegrationId(
        allStoreIntegrations,
        shopName,
    )

    const invalidateAiGuidances = async () => {
        await queryClient.invalidateQueries({
            queryKey: aiGeneratedGuidanceKeys.listWithStore(
                helpCenterId,
                storeIntegrationId,
            ),
        })
    }

    const { data, isLoading: isLoadingAiGuidances } =
        useGetAIGeneratedGuidances(helpCenterId, storeIntegrationId, {
            retry: false,
            refetchOnWindowFocus: false,
        })

    const aiGuidances = useMemo(() => {
        if (!data || !storeIntegrationId) {
            return []
        }
        return data
            .filter((aiGuidance) => aiGuidance.review_action !== 'created')
            .map((aiGuidance) => mapAIGuidanceDTOToAIGuidance(aiGuidance))
            .sort((a, b) => a.name.localeCompare(b.name))
    }, [data, storeIntegrationId])

    const guidanceUsed = useMemo(() => {
        return guidanceArticles.filter(
            (article) => article.visibility === 'PUBLIC',
        )
    }, [guidanceArticles])

    const isAllAIGuidancesUsed =
        data && data.length > 0 && aiGuidances.length === 0

    const hasAIGuidancesFromAPI = !!data && data.length > 0

    return {
        guidanceArticles,
        guidanceUsed,
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
        invalidateAiGuidances,
    }
}
