import { useMemo } from 'react'

import type { GetArticleVersionStatus } from '@gorgias/help-center-types'
import type { FindFeedbackResult } from '@gorgias/knowledge-service-types'

import type { StoreConfiguration } from 'models/aiAgent/types'
import {
    useGetMultipleFileIngestionSnippets,
    useGetMultipleHelpCenter,
    useGetMultipleHelpCenterArticleLists,
} from 'models/helpCenter/queries'
import { useGetProductsByIdsFromIntegration } from 'models/integration/queries'
import { useMultipleGuidanceArticles } from 'pages/aiAgent/hooks/useGuidanceArticles'
import { useMultipleStoreWebsiteQuestions } from 'pages/aiAgent/hooks/useMultipleStoreWebsiteQuestions'
import { useMultiplePublicResources } from 'pages/aiAgent/hooks/usePublicResources'
import { useShopifyIntegrationAndScope } from 'pages/common/hooks/useShopifyIntegrationAndScope'

import {
    DEFAULT_CACHE_TIME,
    DEFAULT_STALE_TIME,
    useActionResources,
    useExtractDistinctHelpCenterFromResources,
    useExtractDistinctProductIdsFromResources,
    useProcessResources,
} from './utils'

export const useGetResourceData = ({
    queriesEnabled = true,
    faqHelpCenterMetadata,
    guidanceHelpCenterMetadata,
    snippetHelpCenterMetadata,
    actionIds,
    productIds,
    shopName,
    shopType,
    shopIntegrationId,
    versionStatus = 'current',
}: {
    queriesEnabled: boolean
    faqHelpCenterMetadata: { ids: number[]; recordIds?: number[] }
    guidanceHelpCenterMetadata: { ids: number[]; recordIds?: number[] }
    snippetHelpCenterMetadata: { ids: number[]; recordIds?: number[] }
    actionIds?: string[]
    productIds: number[]
    shopName: string
    shopType: string
    shopIntegrationId: number
    versionStatus?: GetArticleVersionStatus
}) => {
    const { articles, isLoading: isArticlesLoading } =
        useGetMultipleHelpCenterArticleLists(
            faqHelpCenterMetadata.ids,
            {
                version_status: versionStatus,
                per_page: 100,
                ids: faqHelpCenterMetadata.recordIds,
            },
            {
                enabled:
                    queriesEnabled &&
                    faqHelpCenterMetadata.ids.length > 0 &&
                    (faqHelpCenterMetadata.recordIds?.length ?? 1) > 0,
                refetchOnWindowFocus: false,
                staleTime: DEFAULT_STALE_TIME,
                cacheTime: DEFAULT_CACHE_TIME,
            },
        )

    const { data: products, isLoading: isProductsLoading } =
        useGetProductsByIdsFromIntegration(
            shopIntegrationId,
            productIds,
            queriesEnabled,
        )

    const helpCenterIds = useMemo(
        () => [...faqHelpCenterMetadata.ids, ...guidanceHelpCenterMetadata.ids],
        [faqHelpCenterMetadata.ids, guidanceHelpCenterMetadata.ids],
    )

    const { helpCenters, isLoading: isHelpCentersLoading } =
        useGetMultipleHelpCenter(helpCenterIds, {
            enabled: queriesEnabled && helpCenterIds.length > 0,
            refetchOnWindowFocus: false,
            staleTime: DEFAULT_STALE_TIME,
            cacheTime: DEFAULT_CACHE_TIME,
        })

    const { guidanceArticles, isGuidanceArticleListLoading } =
        useMultipleGuidanceArticles(
            guidanceHelpCenterMetadata.ids,
            {
                enabled: queriesEnabled,
                staleTime: DEFAULT_STALE_TIME,
                cacheTime: DEFAULT_CACHE_TIME,
            },
            {
                ids: guidanceHelpCenterMetadata.recordIds,
                version_status: versionStatus,
            },
        )

    const { sourceItems, isSourceItemsListLoading } =
        useMultiplePublicResources({
            helpCenterIds: snippetHelpCenterMetadata.ids,
            recordIds: snippetHelpCenterMetadata.recordIds,
            queryOptionsOverrides: {
                enabled:
                    queriesEnabled &&
                    snippetHelpCenterMetadata.ids.length > 0 &&
                    (snippetHelpCenterMetadata.recordIds?.length ?? 1) > 0,
                staleTime: DEFAULT_STALE_TIME,
                cacheTime: DEFAULT_CACHE_TIME,
            },
        })

    const { ingestedFiles, isLoading: isIngesting } =
        useGetMultipleFileIngestionSnippets(
            snippetHelpCenterMetadata.ids,
            snippetHelpCenterMetadata.recordIds,
            {
                enabled:
                    queriesEnabled &&
                    snippetHelpCenterMetadata.ids.length > 0 &&
                    (snippetHelpCenterMetadata.recordIds?.length ?? 1) > 0,
                staleTime: DEFAULT_STALE_TIME,
                cacheTime: DEFAULT_CACHE_TIME,
            },
        )

    const { storeWebsiteQuestions, isLoading: isStoreWebsiteQuestionsLoading } =
        useMultipleStoreWebsiteQuestions({
            snippetHelpCenterIds: snippetHelpCenterMetadata.ids,
            recordIds: snippetHelpCenterMetadata.recordIds,
            shopName,
            queryOptionsOverrides: {
                enabled:
                    queriesEnabled &&
                    snippetHelpCenterMetadata.ids.length > 0 &&
                    (snippetHelpCenterMetadata.recordIds?.length ?? 1) > 0,
                staleTime: DEFAULT_STALE_TIME,
                cacheTime: DEFAULT_CACHE_TIME,
            },
        })

    const { actions, isLoading: isActionsLoading } = useActionResources(
        shopName,
        shopType,
        queriesEnabled &&
            !!shopName &&
            !!shopType &&
            (actionIds?.length ?? 1) > 0,
        actionIds,
    )

    const isLoading =
        isArticlesLoading ||
        isGuidanceArticleListLoading ||
        isSourceItemsListLoading ||
        isActionsLoading ||
        isIngesting ||
        isHelpCentersLoading ||
        isStoreWebsiteQuestionsLoading ||
        isProductsLoading

    return useMemo(() => {
        return {
            isLoading,
            articles,
            guidanceArticles,
            sourceItems,
            ingestedFiles,
            actions,
            helpCenters,
            storeWebsiteQuestions,
            products,
        }
    }, [
        isLoading,
        articles,
        sourceItems,
        ingestedFiles,
        guidanceArticles,
        actions,
        helpCenters,
        storeWebsiteQuestions,
        products,
    ])
}

export const useEnrichFeedbackData = ({
    data,
    storeConfiguration,
}: {
    data?: FindFeedbackResult['data']
    storeConfiguration?: StoreConfiguration
}) => {
    const shopName = storeConfiguration?.storeName ?? ''
    const shopType = storeConfiguration?.shopType ?? ''

    const { integrationId } = useShopifyIntegrationAndScope(shopName)

    const queriesEnabled = !!shopName && !!shopType && !!data && !!integrationId

    const relatedHelpCenterData = useExtractDistinctHelpCenterFromResources(
        data?.executions,
        storeConfiguration,
        true,
    )

    const resourceData = useGetResourceData({
        queriesEnabled,
        shopName: shopName,
        shopType: shopType,
        shopIntegrationId: integrationId ?? 0,
        productIds: useExtractDistinctProductIdsFromResources(data?.executions),
        ...relatedHelpCenterData,
    })

    const enrichedData = useProcessResources(
        data?.executions,
        shopName,
        resourceData,
    )

    return {
        isLoading: resourceData?.isLoading,
        enrichedData,
        helpCenters: resourceData?.helpCenters,
        resourceArticles: resourceData?.articles,
        resourceGuidanceArticles: resourceData?.guidanceArticles,
    }
}
