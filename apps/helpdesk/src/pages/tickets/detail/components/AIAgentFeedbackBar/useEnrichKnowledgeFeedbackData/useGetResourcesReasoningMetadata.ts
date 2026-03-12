import type { FindAiReasoningAiReasoningResult } from '@gorgias/knowledge-service-types'

import type { KnowledgeReasoningResource } from 'models/aiAgentFeedback/types'
import { useShopifyIntegrationAndScope } from 'pages/common/hooks/useShopifyIntegrationAndScope'

import { AiAgentKnowledgeResourceTypeEnum } from '../types'
import { useGetResourceData } from './useEnrichFeedbackData'
import { useGetVersionedArticles } from './useGetVersionedArticles'
import { getResourceMetadata, getResourceType } from './utils'

type HelpCenterMetadata = {
    faqHelpCenterMetadata: {
        ids: number[]
        recordIds: number[]
    }
    guidanceHelpCenterMetadata: {
        ids: number[]
        recordIds: number[]
    }
    snippetHelpCenterMetadata: {
        ids: number[]
        recordIds: number[]
    }
    actionIds: string[] | undefined
}

const createEmptyHelpCenterMetadata = (): HelpCenterMetadata => ({
    faqHelpCenterMetadata: {
        ids: [],
        recordIds: [],
    },
    guidanceHelpCenterMetadata: {
        ids: [],
        recordIds: [],
    },
    snippetHelpCenterMetadata: {
        ids: [],
        recordIds: [],
    },
    actionIds: undefined,
})

const categorizeResources = (
    resources: KnowledgeReasoningResource[],
): HelpCenterMetadata => {
    return resources.reduce((acc, resource) => {
        if (
            !resource.resourceSetId ||
            (Number.isNaN(Number(resource.resourceSetId)) &&
                resource.resourceType !==
                    AiAgentKnowledgeResourceTypeEnum.ACTION)
        ) {
            return acc
        }

        switch (resource.resourceType) {
            case AiAgentKnowledgeResourceTypeEnum.ARTICLE:
                if (
                    !acc.faqHelpCenterMetadata.ids.includes(
                        Number(resource.resourceSetId),
                    )
                ) {
                    acc.faqHelpCenterMetadata.ids.push(
                        Number(resource.resourceSetId),
                    )
                }
                if (
                    !acc.faqHelpCenterMetadata.recordIds.includes(
                        Number(resource.resourceId),
                    )
                ) {
                    acc.faqHelpCenterMetadata.recordIds.push(
                        Number(resource.resourceId),
                    )
                }
                break
            case AiAgentKnowledgeResourceTypeEnum.GUIDANCE:
                if (
                    !acc.guidanceHelpCenterMetadata.ids.includes(
                        Number(resource.resourceSetId),
                    )
                ) {
                    acc.guidanceHelpCenterMetadata.ids.push(
                        Number(resource.resourceSetId),
                    )
                }
                if (
                    !acc.guidanceHelpCenterMetadata.recordIds.includes(
                        Number(resource.resourceId),
                    )
                ) {
                    acc.guidanceHelpCenterMetadata.recordIds.push(
                        Number(resource.resourceId),
                    )
                }
                break
            case AiAgentKnowledgeResourceTypeEnum.EXTERNAL_SNIPPET:
            case AiAgentKnowledgeResourceTypeEnum.FILE_EXTERNAL_SNIPPET:
            case AiAgentKnowledgeResourceTypeEnum.STORE_WEBSITE_QUESTION_SNIPPET:
                if (
                    !acc.snippetHelpCenterMetadata.ids.includes(
                        Number(resource.resourceSetId),
                    )
                ) {
                    acc.snippetHelpCenterMetadata.ids.push(
                        Number(resource.resourceSetId),
                    )
                }
                if (
                    !acc.snippetHelpCenterMetadata.recordIds.includes(
                        Number(resource.resourceId),
                    )
                ) {
                    acc.snippetHelpCenterMetadata.recordIds.push(
                        Number(resource.resourceId),
                    )
                }
                break
            case AiAgentKnowledgeResourceTypeEnum.ACTION:
                if (!acc.actionIds) {
                    acc.actionIds = []
                }
                if (!acc.actionIds.includes(resource.resourceId)) {
                    acc.actionIds.push(resource.resourceId)
                }
                break
            default:
        }
        return acc
    }, createEmptyHelpCenterMetadata())
}

export const useGetResourcesReasoningMetadata = ({
    resources,
    storeConfiguration,
    queriesEnabled = true,
}: {
    resources: KnowledgeReasoningResource[]
    storeConfiguration?:
        | FindAiReasoningAiReasoningResult['data']['storeConfiguration']
        | null
    queriesEnabled?: boolean
}) => {
    const shopName = storeConfiguration?.shopName ?? ''
    const shopType = storeConfiguration?.shopType ?? ''

    const { integrationId } = useShopifyIntegrationAndScope(shopName)

    // Separate draft and non-draft resources
    const draftResources = resources.filter((r) => r.resourceIsDraft === true)

    const productIds = resources
        .filter(
            (resource) =>
                resource.resourceType ===
                    AiAgentKnowledgeResourceTypeEnum.PRODUCT_KNOWLEDGE ||
                resource.resourceType ===
                    AiAgentKnowledgeResourceTypeEnum.PRODUCT_RECOMMENDATION,
        )
        .map((resource) => Number(resource.resourceId))

    // Categorize all resources for the current (published) fetch
    const relatedHelpCenterData = categorizeResources(resources)

    // Categorize only draft resources for the draft fetch
    const draftRelatedHelpCenterData = categorizeResources(draftResources)

    // Check if we have any draft articles or guidance to fetch
    const hasDraftArticlesOrGuidance =
        draftRelatedHelpCenterData.faqHelpCenterMetadata.recordIds.length > 0 ||
        draftRelatedHelpCenterData.guidanceHelpCenterMetadata.recordIds.length >
            0

    // Fetch all resources with 'current' version (published content)
    const publishedResourceData = useGetResourceData({
        queriesEnabled,
        ...relatedHelpCenterData,
        shopName,
        shopType,
        shopIntegrationId: integrationId ?? 0,
        productIds,
        versionStatus: 'current',
    })

    // Fetch only draft resources with 'latest_draft' version
    const draftResourceData = useGetResourceData({
        queriesEnabled: queriesEnabled && hasDraftArticlesOrGuidance,
        ...draftRelatedHelpCenterData,
        shopName,
        shopType,
        shopIntegrationId: integrationId ?? 0,
        productIds: [], // Products don't have draft versions
        versionStatus: 'latest_draft',
    })

    const { isLoading: isVersionedLoading, versionedArticlesMap } =
        useGetVersionedArticles(resources, queriesEnabled)

    if (!publishedResourceData) {
        return null
    }

    const isLoading =
        publishedResourceData.isLoading ||
        (hasDraftArticlesOrGuidance && draftResourceData?.isLoading) ||
        isVersionedLoading

    return {
        isLoading,
        data: resources.map((resource) => {
            const type = getResourceType(
                resource.resourceId,
                resource.resourceType as AiAgentKnowledgeResourceTypeEnum,
                {
                    storeWebsiteQuestions:
                        publishedResourceData.storeWebsiteQuestions ?? [],
                    ingestedFiles: publishedResourceData.ingestedFiles ?? [],
                },
            )

            resource.resourceType = type as typeof resource.resourceType

            const versionedData = versionedArticlesMap.get(resource.resourceId)
            if (versionedData) {
                const fallbackMetadata = getResourceMetadata(
                    {
                        id: resource.resourceId,
                        title: resource.resourceTitle,
                        type: resource.resourceType,
                    },
                    shopName,
                    publishedResourceData,
                )
                return {
                    title: versionedData.title,
                    content: versionedData.content,
                    helpCenterId: versionedData.helpCenterId,
                    url:
                        fallbackMetadata && 'url' in fallbackMetadata
                            ? fallbackMetadata.url
                            : undefined,
                    versionId: versionedData.versionId,
                }
            }

            // For draft resources, try to get metadata from draftResourceData first
            // Fall back to publishedResourceData if draft data is not available
            if (resource.resourceIsDraft && draftResourceData) {
                const draftMetadata = getResourceMetadata(
                    {
                        id: resource.resourceId,
                        title: resource.resourceTitle,
                        type: resource.resourceType,
                    },
                    shopName,
                    draftResourceData,
                )
                // If we found draft metadata and it's not deleted, use it
                if (
                    draftMetadata &&
                    !('isDeleted' in draftMetadata && draftMetadata.isDeleted)
                ) {
                    return draftMetadata
                }
            }

            // For non-draft resources or fallback, use current (published) data
            return getResourceMetadata(
                {
                    id: resource.resourceId,
                    title: resource.resourceTitle,
                    type: resource.resourceType,
                },
                shopName,
                publishedResourceData,
            )
        }),
    }
}
