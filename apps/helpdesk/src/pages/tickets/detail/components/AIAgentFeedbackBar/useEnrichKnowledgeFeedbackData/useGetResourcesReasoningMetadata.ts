import { FindAiReasoningAiReasoningResult } from '@gorgias/knowledge-service-types'

import { KnowledgeReasoningResource } from 'models/aiAgentFeedback/types'
import { useShopifyIntegrationAndScope } from 'pages/common/hooks/useShopifyIntegrationAndScope'
import { getLDClient } from 'utils/launchDarkly'

import { AiAgentKnowledgeResourceTypeEnum } from '../types'
import { useGetResourceData } from './useEnrichFeedbackData'
import { getResourceMetadata } from './utils'

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
    const flags = getLDClient().allFlags()

    const { integrationId } = useShopifyIntegrationAndScope(shopName)
    const productIds = resources
        .filter(
            (resource) =>
                resource.resourceType ===
                    AiAgentKnowledgeResourceTypeEnum.PRODUCT_KNOWLEDGE ||
                resource.resourceType ===
                    AiAgentKnowledgeResourceTypeEnum.PRODUCT_RECOMMENDATION,
        )
        .map((resource) => Number(resource.resourceId))

    const relatedHelpCenterData = resources.reduce(
        (acc, resource) => {
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
        },
        {
            faqHelpCenterMetadata: {
                ids: [] as number[],
                recordIds: [] as number[],
            },
            guidanceHelpCenterMetadata: {
                ids: [] as number[],
                recordIds: [] as number[],
            },
            snippetHelpCenterMetadata: {
                ids: [] as number[],
                recordIds: [] as number[],
            },
            actionIds: undefined as string[] | undefined,
        },
    )

    const resourceData = useGetResourceData({
        queriesEnabled,
        ...relatedHelpCenterData,
        shopName,
        shopType,
        shopIntegrationId: integrationId ?? 0,
        productIds,
    })

    if (!resourceData) {
        return null
    }

    return {
        isLoading: resourceData.isLoading,
        data: resources.map((resource) => {
            return getResourceMetadata(
                {
                    id: resource.resourceId,
                    title: resource.resourceTitle,
                    type: resource.resourceType,
                },
                shopName,
                flags,
                resourceData,
            )
        }),
    }
}
