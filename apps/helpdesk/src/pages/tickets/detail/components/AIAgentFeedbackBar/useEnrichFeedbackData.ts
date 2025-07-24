import { useMemo } from 'react'

import { useFlags } from 'launchdarkly-react-client-sdk'

import {
    FeedbackExecutionsItem,
    FindAiReasoningAiReasoningResult,
    FindFeedbackResult,
} from '@gorgias/knowledge-service-types'

import { FeatureFlagKey } from 'config/featureFlags'
import { shopifyAdminBaseUrl } from 'config/integrations/shopify'
import { StoreConfiguration } from 'models/aiAgent/types'
import { KnowledgeReasoningResource } from 'models/aiAgentFeedback/types'
import {
    useGetMultipleFileIngestionSnippets,
    useGetMultipleHelpCenter,
    useGetMultipleHelpCenterArticleLists,
} from 'models/helpCenter/queries'
import { useGetProductsByIdsFromIntegration } from 'models/integration/queries'
import { useGetStoreWorkflowsConfigurations } from 'models/workflows/queries'
import { getAiAgentNavigationRoutes } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import { useMultipleGuidanceArticles } from 'pages/aiAgent/hooks/useGuidanceArticles'
import { useMultipleStoreWebsiteQuestions } from 'pages/aiAgent/hooks/useMultipleStoreWebsiteQuestions'
import { useMultiplePublicResources } from 'pages/aiAgent/hooks/usePublicResources'
import { useShopifyIntegrationAndScope } from 'pages/common/hooks/useShopifyIntegrationAndScope'
import {
    AiAgentFeedbackTypeEnum,
    AiAgentKnowledgeResourceTypeEnum,
    FreeForm,
    KnowledgeResource,
    SuggestedResource,
    suggestedResourceValueSchema,
} from 'pages/tickets/detail/components/AIAgentFeedbackBar/types'
import { getLDClient } from 'utils/launchDarkly'

import { getHelpCenterArticleUrl } from './utils'

const DEFAULT_STALE_TIME = 10 * 60 * 1000
const DEFAULT_CACHE_TIME = 10 * 60 * 1000

export const knowledgeResourceOrder = [
    AiAgentKnowledgeResourceTypeEnum.GUIDANCE,
    AiAgentKnowledgeResourceTypeEnum.ACTION,
    AiAgentKnowledgeResourceTypeEnum.ARTICLE,
    AiAgentKnowledgeResourceTypeEnum.STORE_WEBSITE_QUESTION_SNIPPET,
    AiAgentKnowledgeResourceTypeEnum.ORDER,
    AiAgentKnowledgeResourceTypeEnum.PRODUCT_KNOWLEDGE,
    AiAgentKnowledgeResourceTypeEnum.PRODUCT_RECOMMENDATION,
    AiAgentKnowledgeResourceTypeEnum.EXTERNAL_SNIPPET,
    AiAgentKnowledgeResourceTypeEnum.FILE_EXTERNAL_SNIPPET,
]

const mockProductRecommendation = {
    id: 'id-1',
    resourceId: '15029551137137',
    feedback: null,
    resourceType: AiAgentKnowledgeResourceTypeEnum.PRODUCT_RECOMMENDATION,
    resourceLocale: null,
    resourceSetId: '15029551137137',
    resourceTitle: 'ADIDAS | CLASSIC BACKPACK | LEGEND INK MULTICOLOUR',
}

// TODO: REMOVE IN PRODUCTION - Mock products for testing purposes only
const mockProductKnowledge = {
    id: 'id-2',
    resourceId: '15029551104369',
    feedback: null,
    resourceType: AiAgentKnowledgeResourceTypeEnum.PRODUCT_KNOWLEDGE,
    resourceLocale: null,
    resourceSetId: '15029551104369',
    resourceTitle: 'ADIDAS | CLASSIC BACKPACK',
}

/**
 * Extracts distinct help center IDs from resources
 */
const useExtractDistinctHelpCenterFromResources = (
    executions?: FeedbackExecutionsItem[],
    storeConfiguration?: StoreConfiguration,
) => {
    return useMemo(() => {
        const output: {
            faqHelpCenterIds: number[]
            guidanceHelpCenterIds: number[]
            snippetHelpCenterIds: number[]
        } = {
            faqHelpCenterIds: [storeConfiguration?.helpCenterId ?? 0],
            guidanceHelpCenterIds: [
                storeConfiguration?.guidanceHelpCenterId ?? 0,
            ],
            snippetHelpCenterIds: [
                storeConfiguration?.snippetHelpCenterId ?? 0,
            ],
        }

        for (const execution of executions ?? []) {
            for (const feedback of execution.feedback) {
                if (
                    feedback.feedbackType ===
                    AiAgentFeedbackTypeEnum.SUGGESTED_RESOURCE
                ) {
                    try {
                        const resource = suggestedResourceValueSchema.parse(
                            JSON.parse(feedback.feedbackValue ?? '{}'),
                        )
                        switch (resource.resourceType) {
                            case AiAgentKnowledgeResourceTypeEnum.ARTICLE:
                                output.faqHelpCenterIds.push(
                                    Number(resource.resourceSetId),
                                )
                                break
                            case AiAgentKnowledgeResourceTypeEnum.GUIDANCE:
                                output.guidanceHelpCenterIds.push(
                                    Number(resource.resourceSetId),
                                )
                                break
                            case AiAgentKnowledgeResourceTypeEnum.EXTERNAL_SNIPPET:
                                output.snippetHelpCenterIds.push(
                                    Number(resource.resourceSetId),
                                )
                                break
                            case AiAgentKnowledgeResourceTypeEnum.FILE_EXTERNAL_SNIPPET:
                                output.snippetHelpCenterIds.push(
                                    Number(resource.resourceSetId),
                                )
                                break
                            default:
                                break
                        }
                    } catch (error) {
                        console.error(error)
                    }
                }
            }
            for (const resource of execution.resources ?? []) {
                switch (resource.resourceType) {
                    case AiAgentKnowledgeResourceTypeEnum.ARTICLE:
                        output.faqHelpCenterIds.push(
                            Number(resource.resourceSetId),
                        )
                        break
                    case AiAgentKnowledgeResourceTypeEnum.GUIDANCE:
                        output.guidanceHelpCenterIds.push(
                            Number(resource.resourceSetId),
                        )
                        break
                    case AiAgentKnowledgeResourceTypeEnum.EXTERNAL_SNIPPET:
                        output.snippetHelpCenterIds.push(
                            Number(resource.resourceSetId),
                        )
                        break
                    case AiAgentKnowledgeResourceTypeEnum.FILE_EXTERNAL_SNIPPET:
                        output.snippetHelpCenterIds.push(
                            Number(resource.resourceSetId),
                        )
                        break
                    default:
                        break
                }
            }
        }
        return {
            faqHelpCenterIds: [...new Set(output.faqHelpCenterIds)],
            guidanceHelpCenterIds: [...new Set(output.guidanceHelpCenterIds)],
            snippetHelpCenterIds: [...new Set(output.snippetHelpCenterIds)],
        }
    }, [executions, storeConfiguration])
}

/**
 * Extracts distinct products IDs from resources
 */
const useExtractDistinctProductIdsFromResources = (
    executions?: FindFeedbackResult['data']['executions'],
) => {
    return useMemo(() => {
        const output: number[] = []

        for (const execution of executions ?? []) {
            for (const resource of execution.resources ?? []) {
                switch (resource.resourceType) {
                    case AiAgentKnowledgeResourceTypeEnum.PRODUCT_KNOWLEDGE:
                    case AiAgentKnowledgeResourceTypeEnum.PRODUCT_RECOMMENDATION:
                        output.push(Number(resource.resourceId))
                        break
                    default:
                        break
                }
            }
        }

        return output
    }, [executions])
}

/**
 * Fetches action resources based on extracted resource data
 */
const useActionResources = (
    shopName: string,
    shopType: string,
    queryEnabled = true,
) => {
    const { data, isLoading } = useGetStoreWorkflowsConfigurations(
        {
            storeName: shopName,
            storeType: shopType,
            triggers: ['llm-prompt'],
        },
        {
            enabled: queryEnabled,
            staleTime: DEFAULT_STALE_TIME,
            cacheTime: DEFAULT_CACHE_TIME,
        },
    )

    return {
        actions: data ?? [],
        isLoading: queryEnabled && isLoading,
    }
}

const emptyMetadata = {
    title: '',
    content: '',
    isDeleted: true,
}

export const getResourceMetadata = (
    {
        id,
        title,
        type,
    }: {
        id: string
        title?: string
        type: AiAgentKnowledgeResourceTypeEnum
    },
    shopName: string,
    resourceData: {
        articles: NonNullable<
            ReturnType<typeof useGetMultipleHelpCenterArticleLists>['articles']
        >
        guidanceArticles: NonNullable<
            ReturnType<typeof useMultipleGuidanceArticles>['guidanceArticles']
        >
        sourceItems: NonNullable<
            ReturnType<typeof useMultiplePublicResources>['sourceItems']
        >
        ingestedFiles: NonNullable<
            ReturnType<
                typeof useGetMultipleFileIngestionSnippets
            >['ingestedFiles']
        >
        actions: NonNullable<ReturnType<typeof useActionResources>['actions']>
        helpCenters: NonNullable<
            ReturnType<typeof useGetMultipleHelpCenter>['helpCenters']
        >
        storeWebsiteQuestions: NonNullable<
            ReturnType<
                typeof useMultipleStoreWebsiteQuestions
            >['storeWebsiteQuestions']
        >
        products: NonNullable<
            ReturnType<typeof useGetProductsByIdsFromIntegration>['data']
        >
    } | null,
) => {
    const flags = getLDClient().allFlags()
    const aiAgentRoutes = shopName
        ? getAiAgentNavigationRoutes(shopName, flags)
        : undefined

    const idAsNumber = parseInt(id)

    if (!resourceData) {
        return null
    }

    const {
        articles,
        guidanceArticles,
        sourceItems,
        ingestedFiles,
        actions,
        helpCenters,
        storeWebsiteQuestions,
        products,
    } = resourceData

    switch (type) {
        case AiAgentKnowledgeResourceTypeEnum.ARTICLE: {
            const article = articles.find(
                (article) => article.id === idAsNumber,
            )
            const helpCenter = helpCenters.find(
                (hc) => hc?.id === article?.helpCenterId,
            )

            const articleUrl =
                helpCenter &&
                article &&
                getHelpCenterArticleUrl(article, helpCenter)

            return article
                ? {
                      title: article.translation.title ?? '',
                      content: article.translation.content ?? '',
                      url: articleUrl ?? '',
                      helpCenterId: article.helpCenterId,
                  }
                : emptyMetadata
        }
        case AiAgentKnowledgeResourceTypeEnum.GUIDANCE: {
            const guidance = guidanceArticles.find(
                (guidance) => guidance.id === idAsNumber,
            )

            return guidance
                ? {
                      title: guidance.title ?? '',
                      content: guidance.content ?? '',
                      url: aiAgentRoutes?.guidanceArticleEdit(idAsNumber),
                      helpCenterId: guidance.helpCenterId,
                  }
                : emptyMetadata
        }
        case AiAgentKnowledgeResourceTypeEnum.EXTERNAL_SNIPPET: {
            const snippet = sourceItems.find(
                (snippet) => snippet.id === idAsNumber,
            )

            if (snippet) {
                return {
                    title: snippet.title,
                    content: snippet.title,
                    url:
                        aiAgentRoutes?.urlArticlesDetail(
                            snippet.ingestionId,
                            parseInt(id),
                        ) ?? '',
                }
            }
            return emptyMetadata
        }
        case AiAgentKnowledgeResourceTypeEnum.STORE_WEBSITE_QUESTION_SNIPPET: {
            const storeWebsiteQuestion = storeWebsiteQuestions.find(
                (question) => question.article_id === idAsNumber,
            )
            if (storeWebsiteQuestion) {
                return {
                    title: storeWebsiteQuestion.title,
                    content: storeWebsiteQuestion.title,
                    url:
                        aiAgentRoutes?.questionsContentDetail(parseInt(id)) ??
                        '',
                }
            }
            return emptyMetadata
        }
        case AiAgentKnowledgeResourceTypeEnum.FILE_EXTERNAL_SNIPPET: {
            const fileSnippet = ingestedFiles
                .filter((file) => file.ingestionStatus === 'SUCCESSFUL')
                .find((fileSnippet) => fileSnippet.id === idAsNumber)
            return fileSnippet
                ? {
                      title: fileSnippet.title,
                      content: fileSnippet.title,
                      url:
                          aiAgentRoutes?.fileArticlesDetail(
                              fileSnippet.ingestionId,
                              parseInt(id),
                          ) ?? '',
                  }
                : emptyMetadata
        }

        case AiAgentKnowledgeResourceTypeEnum.ACTION: {
            const action = actions.find((action) => action.id === id)
            return action
                ? {
                      title: action.name ?? '',
                      content: action.name ?? '',
                      url: aiAgentRoutes?.editAction(id) ?? '',
                  }
                : emptyMetadata
        }
        case AiAgentKnowledgeResourceTypeEnum.ORDER: {
            return {
                title: `Order ${title}`,
                content: `Order ${title}`,
                url: shopifyAdminBaseUrl(shopName) + `/orders/${id}`,
            }
        }
        case AiAgentKnowledgeResourceTypeEnum.PRODUCT_KNOWLEDGE:
        case AiAgentKnowledgeResourceTypeEnum.PRODUCT_RECOMMENDATION: {
            const product = products.find(
                (product) => product.id === idAsNumber,
            )
            return product
                ? {
                      title: title ?? '',
                      content: title ?? '',
                      url: aiAgentRoutes?.productsContentDetail(idAsNumber),
                  }
                : emptyMetadata
        }
        default: {
            return emptyMetadata
        }
    }
}

const getResourceType = (
    resourceId: string,
    type: AiAgentKnowledgeResourceTypeEnum,
    {
        storeWebsiteQuestions,
        ingestedFiles,
    }: {
        ingestedFiles: NonNullable<
            ReturnType<
                typeof useGetMultipleFileIngestionSnippets
            >['ingestedFiles']
        >
        storeWebsiteQuestions: NonNullable<
            ReturnType<
                typeof useMultipleStoreWebsiteQuestions
            >['storeWebsiteQuestions']
        >
    },
) => {
    if (type === AiAgentKnowledgeResourceTypeEnum.EXTERNAL_SNIPPET) {
        const storeWebsiteQuestion = storeWebsiteQuestions.find(
            (question) =>
                question.article_id.toString() === resourceId.toString(),
        )
        if (storeWebsiteQuestion) {
            return AiAgentKnowledgeResourceTypeEnum.STORE_WEBSITE_QUESTION_SNIPPET
        }

        const fileSnippet = ingestedFiles
            .filter((file) => file.ingestionStatus === 'SUCCESSFUL')
            .find((fileSnippet) => fileSnippet.id === parseInt(resourceId))

        if (fileSnippet) {
            return AiAgentKnowledgeResourceTypeEnum.FILE_EXTERNAL_SNIPPET
        }
    }
    return type
}

/**
 * Merges all fetched resources into final enriched data structure
 */
const useProcessResources = (
    executions: FeedbackExecutionsItem[] = [],
    shopName: string,
    hasSurfacedProductsInFeedback: boolean,
    resourceData: {
        articles: NonNullable<
            ReturnType<typeof useGetMultipleHelpCenterArticleLists>['articles']
        >
        guidanceArticles: NonNullable<
            ReturnType<typeof useMultipleGuidanceArticles>['guidanceArticles']
        >
        sourceItems: NonNullable<
            ReturnType<typeof useMultiplePublicResources>['sourceItems']
        >
        ingestedFiles: NonNullable<
            ReturnType<
                typeof useGetMultipleFileIngestionSnippets
            >['ingestedFiles']
        >
        actions: NonNullable<ReturnType<typeof useActionResources>['actions']>
        helpCenters: NonNullable<
            ReturnType<typeof useGetMultipleHelpCenter>['helpCenters']
        >
        storeWebsiteQuestions: NonNullable<
            ReturnType<
                typeof useMultipleStoreWebsiteQuestions
            >['storeWebsiteQuestions']
        >
        products: NonNullable<
            ReturnType<typeof useGetProductsByIdsFromIntegration>['data']
        >
    } | null,
) => {
    return useMemo(() => {
        const output: {
            knowledgeResources: KnowledgeResource[]
            suggestedResources: SuggestedResource[]
            freeForm: FreeForm | null
        } = {
            knowledgeResources: [],
            suggestedResources: [],
            freeForm: null,
        }

        if (!resourceData) {
            return output
        }

        executions.forEach((execution) => {
            execution.resources.forEach((resource) => {
                const type = getResourceType(
                    resource.resourceId,
                    resource.resourceType as AiAgentKnowledgeResourceTypeEnum,
                    {
                        storeWebsiteQuestions:
                            resourceData?.storeWebsiteQuestions ?? [],
                        ingestedFiles: resourceData?.ingestedFiles ?? [],
                    },
                )

                if (
                    !hasSurfacedProductsInFeedback &&
                    (type === 'PRODUCT_KNOWLEDGE' ||
                        type === 'PRODUCT_RECOMMENDATION')
                ) {
                    return
                }

                resource.resourceType = type as typeof resource.resourceType
                let metadata = getResourceMetadata(
                    {
                        id: resource.resourceId,
                        title: resource.resourceTitle,
                        type: resource.resourceType as AiAgentKnowledgeResourceTypeEnum,
                    },
                    shopName,
                    resourceData,
                )

                if (!metadata) {
                    return
                }

                output.knowledgeResources.push({
                    executionId: execution.executionId,
                    resource: resource,
                    feedback: resource.feedback
                        ? {
                              ...resource.feedback,
                              feedbackType: resource.feedback.feedbackType,
                          }
                        : undefined,
                    metadata,
                })
            })

            execution.feedback.forEach((feedback) => {
                if (feedback.targetType === 'TICKET') {
                    if (feedback.feedbackType === 'TICKET_FREEFORM') {
                        output.freeForm = {
                            executionId: execution.executionId,
                            feedback: feedback,
                        }
                    } else if (feedback.feedbackType === 'SUGGESTED_RESOURCE') {
                        try {
                            const parsedResource =
                                suggestedResourceValueSchema.parse(
                                    JSON.parse(feedback.feedbackValue ?? '{}'),
                                )

                            let metadata = getResourceMetadata(
                                {
                                    id: parsedResource.resourceId,
                                    type: parsedResource.resourceType as AiAgentKnowledgeResourceTypeEnum,
                                },
                                shopName,
                                resourceData,
                            )

                            if (!metadata) {
                                return
                            }
                            output.suggestedResources.push({
                                executionId: execution.executionId,
                                feedback: feedback,
                                parsedResource,
                                metadata,
                            })
                        } catch (err) {
                            console.error(
                                'Error parsing suggested resource',
                                err,
                            )
                        }
                    }
                }
            })
        })

        // Sort knowledgeResources based on knowledgeResourceOrder
        output.knowledgeResources.sort((a, b) => {
            const aIndex = knowledgeResourceOrder.indexOf(
                a.resource.resourceType as AiAgentKnowledgeResourceTypeEnum,
            )
            const bIndex = knowledgeResourceOrder.indexOf(
                b.resource.resourceType as AiAgentKnowledgeResourceTypeEnum,
            )

            return aIndex - bIndex
        })

        // Sort suggestedResources based on knowledgeResourceOrder
        output.suggestedResources.sort((a, b) => {
            const aIndex = knowledgeResourceOrder.indexOf(
                a.parsedResource
                    .resourceType as AiAgentKnowledgeResourceTypeEnum,
            )
            const bIndex = knowledgeResourceOrder.indexOf(
                b.parsedResource
                    .resourceType as AiAgentKnowledgeResourceTypeEnum,
            )

            return aIndex - bIndex
        })

        return output
    }, [executions, shopName, hasSurfacedProductsInFeedback, resourceData])
}

export const useGetResourceData = ({
    queriesEnabled = true,
    faqHelpCenterIds,
    guidanceHelpCenterIds,
    snippetHelpCenterIds,
    productIds,
    shopName,
    shopType,
    shopIntegrationId,
}: {
    queriesEnabled: boolean
    faqHelpCenterIds: number[]
    guidanceHelpCenterIds: number[]
    snippetHelpCenterIds: number[]
    productIds: number[]
    shopName: string
    shopType: string
    shopIntegrationId: number
}) => {
    const { articles, isLoading: isArticlesLoading } =
        useGetMultipleHelpCenterArticleLists(
            faqHelpCenterIds,
            {
                version_status: 'latest_draft',
                per_page: 1000,
            },
            {
                enabled: queriesEnabled && faqHelpCenterIds.length > 0,
                refetchOnWindowFocus: false,
                staleTime: DEFAULT_STALE_TIME,
                cacheTime: DEFAULT_CACHE_TIME,
            },
        )

    const helpCenterIds = useMemo(
        () => [...faqHelpCenterIds, ...guidanceHelpCenterIds],
        [faqHelpCenterIds, guidanceHelpCenterIds],
    )

    const { helpCenters, isLoading: isHelpCentersLoading } =
        useGetMultipleHelpCenter(helpCenterIds, {
            enabled: queriesEnabled && helpCenterIds.length > 0,
            refetchOnWindowFocus: false,
            staleTime: DEFAULT_STALE_TIME,
            cacheTime: DEFAULT_CACHE_TIME,
        })

    const { guidanceArticles, isGuidanceArticleListLoading } =
        useMultipleGuidanceArticles(guidanceHelpCenterIds, {
            enabled: queriesEnabled,
            staleTime: DEFAULT_STALE_TIME,
            cacheTime: DEFAULT_CACHE_TIME,
        })

    const { sourceItems, isSourceItemsListLoading } =
        useMultiplePublicResources({
            helpCenterIds: snippetHelpCenterIds,
            queryOptionsOverrides: {
                enabled: queriesEnabled && snippetHelpCenterIds.length > 0,
                staleTime: DEFAULT_STALE_TIME,
                cacheTime: DEFAULT_CACHE_TIME,
            },
        })

    const { ingestedFiles, isLoading: isIngesting } =
        useGetMultipleFileIngestionSnippets(
            snippetHelpCenterIds,
            {},
            {
                enabled: queriesEnabled && snippetHelpCenterIds.length > 0,
                staleTime: DEFAULT_STALE_TIME,
                cacheTime: DEFAULT_CACHE_TIME,
            },
        )

    const { storeWebsiteQuestions, isLoading: isStoreWebsiteQuestionsLoading } =
        useMultipleStoreWebsiteQuestions({
            snippetHelpCenterIds,
            shopName,
            queryOptionsOverrides: {
                enabled: queriesEnabled && snippetHelpCenterIds.length > 0,
                staleTime: DEFAULT_STALE_TIME,
                cacheTime: DEFAULT_CACHE_TIME,
            },
        })

    const { actions, isLoading: isActionsLoading } = useActionResources(
        shopName,
        shopType,
        queriesEnabled && !!shopName && !!shopType,
    )

    const { data: products, isLoading: isProductsLoading } =
        useGetProductsByIdsFromIntegration(
            shopIntegrationId,
            productIds,
            queriesEnabled,
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
        if (isLoading) {
            return null
        }

        return {
            isLoading,
            articles,
            guidanceArticles,
            sourceItems,
            ingestedFiles,
            actions,
            helpCenters,
            storeWebsiteQuestions,
            products: products || [],
        }
    }, [
        isLoading,
        articles,
        guidanceArticles,
        sourceItems,
        ingestedFiles,
        actions,
        helpCenters,
        storeWebsiteQuestions,
        products,
    ])
}

export const useGetKnowledgeResourceData = (props: {
    queriesEnabled: boolean
    faqHelpCenterQueryData: { ids: number[]; recordIds: number[] }
    guidanceHelpCenterQueryData: { ids: number[]; recordIds: number[] }
    snippetHelpCenterQueryData: { ids: number[]; recordIds: number[] }
    actionIds: number[]
    productIds: number[]
    shopName: string
    shopType: string
    shopIntegrationId: number
}) => {
    const {
        queriesEnabled,
        faqHelpCenterQueryData,
        guidanceHelpCenterQueryData,
        snippetHelpCenterQueryData,
        actionIds,
        productIds,
        shopName,
        shopType,
        shopIntegrationId,
    } = props
    const { articles, isLoading: isArticlesLoading } =
        useGetMultipleHelpCenterArticleLists(
            faqHelpCenterQueryData.ids,
            {
                ids: faqHelpCenterQueryData.recordIds,
                version_status: 'latest_draft',
                per_page: 1000,
            },
            {
                enabled:
                    queriesEnabled &&
                    faqHelpCenterQueryData.ids.length > 0 &&
                    faqHelpCenterQueryData.recordIds.length > 0,
                refetchOnWindowFocus: false,
                staleTime: DEFAULT_STALE_TIME,
                cacheTime: DEFAULT_CACHE_TIME,
            },
        )

    const helpCenterIds = [
        ...faqHelpCenterQueryData.ids,
        ...guidanceHelpCenterQueryData.ids,
    ]

    const { helpCenters, isLoading: isHelpCentersLoading } =
        useGetMultipleHelpCenter(helpCenterIds, {
            enabled: queriesEnabled && helpCenterIds.length > 0,
            refetchOnWindowFocus: false,
            staleTime: DEFAULT_STALE_TIME,
            cacheTime: DEFAULT_CACHE_TIME,
        })

    const { guidanceArticles, isGuidanceArticleListLoading } =
        useMultipleGuidanceArticles(
            guidanceHelpCenterQueryData.ids,
            {
                enabled:
                    queriesEnabled &&
                    guidanceHelpCenterQueryData.ids.length > 0 &&
                    guidanceHelpCenterQueryData.recordIds.length > 0,
                staleTime: DEFAULT_STALE_TIME,
                cacheTime: DEFAULT_CACHE_TIME,
            },
            {
                ids: guidanceHelpCenterQueryData.recordIds,
            },
        )

    const { sourceItems, isSourceItemsListLoading } =
        useMultiplePublicResources({
            helpCenterIds: snippetHelpCenterQueryData.ids,
            queryOptionsOverrides: {
                enabled:
                    queriesEnabled &&
                    snippetHelpCenterQueryData.ids.length > 0 &&
                    snippetHelpCenterQueryData.recordIds.length > 0,
                staleTime: DEFAULT_STALE_TIME,
                cacheTime: DEFAULT_CACHE_TIME,
            },
        })

    const { ingestedFiles, isLoading: isIngesting } =
        useGetMultipleFileIngestionSnippets(
            snippetHelpCenterQueryData.ids,
            {},
            {
                enabled:
                    queriesEnabled &&
                    snippetHelpCenterQueryData.ids.length > 0 &&
                    snippetHelpCenterQueryData.recordIds.length > 0,
                staleTime: DEFAULT_STALE_TIME,
                cacheTime: DEFAULT_CACHE_TIME,
            },
        )

    const { storeWebsiteQuestions, isLoading: isStoreWebsiteQuestionsLoading } =
        useMultipleStoreWebsiteQuestions({
            snippetHelpCenterIds: snippetHelpCenterQueryData.ids,
            shopName,
            queryOptionsOverrides: {
                enabled:
                    queriesEnabled &&
                    snippetHelpCenterQueryData.ids.length > 0 &&
                    snippetHelpCenterQueryData.recordIds.length > 0,
                staleTime: DEFAULT_STALE_TIME,
                cacheTime: DEFAULT_CACHE_TIME,
            },
        })

    const { actions, isLoading: isActionsLoading } = useActionResources(
        shopName,
        shopType,
        queriesEnabled && !!shopName && !!shopType && actionIds.length > 0,
    )

    const { data: products, isLoading: isProductsLoading } =
        useGetProductsByIdsFromIntegration(
            shopIntegrationId,
            productIds,
            queriesEnabled && productIds.length > 0 && !!shopIntegrationId,
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

    if (isLoading) {
        return null
    }

    return {
        isLoading,
        articles,
        guidanceArticles,
        sourceItems,
        ingestedFiles,
        actions,
        helpCenters,
        storeWebsiteQuestions,
        products: products || [],
    }
}

export const useGetKnowledgeResourceMetadata = ({
    data,
    storeConfiguration,
    queriesEnabled,
    hasSurfacedProductsInFeedback,
}: {
    data?: FindFeedbackResult['data']
    storeConfiguration?: StoreConfiguration
    queriesEnabled: boolean
    hasSurfacedProductsInFeedback: boolean
}) => {
    const shopName = storeConfiguration?.storeName ?? ''
    const shopType = storeConfiguration?.shopType ?? ''

    const { integrationId } = useShopifyIntegrationAndScope(shopName)

    const knowledgeReourceQueryData = useMemo(() => {
        const knowledgeResources = data?.executions?.flatMap(
            (execution) => execution.resources,
        )
        const {
            faqHelpCenterQueryData,
            guidanceHelpCenterQueryData,
            snippetHelpCenterQueryData,
            actionIds,
            productIds,
        } = {
            faqHelpCenterQueryData: {
                ids: [] as number[],
                recordIds: [] as number[],
            },
            guidanceHelpCenterQueryData: {
                ids: [] as number[],
                recordIds: [] as number[],
            },
            snippetHelpCenterQueryData: {
                ids: [] as number[],
                recordIds: [] as number[],
            },
            actionIds: [] as number[],
            productIds: [] as number[],
        }
        for (const resource of knowledgeResources ?? []) {
            switch (resource.resourceType) {
                case AiAgentKnowledgeResourceTypeEnum.ARTICLE:
                    if (
                        !faqHelpCenterQueryData.ids.includes(
                            Number(resource.resourceSetId),
                        )
                    ) {
                        faqHelpCenterQueryData.ids.push(
                            Number(resource.resourceSetId),
                        )
                    }
                    faqHelpCenterQueryData.recordIds.push(
                        Number(resource.resourceId),
                    )
                    break
                case AiAgentKnowledgeResourceTypeEnum.GUIDANCE:
                    if (
                        !guidanceHelpCenterQueryData.ids.includes(
                            Number(resource.resourceSetId),
                        )
                    ) {
                        guidanceHelpCenterQueryData.ids.push(
                            Number(resource.resourceSetId),
                        )
                    }
                    guidanceHelpCenterQueryData.recordIds.push(
                        Number(resource.resourceId),
                    )
                    break
                case AiAgentKnowledgeResourceTypeEnum.EXTERNAL_SNIPPET:
                case AiAgentKnowledgeResourceTypeEnum.FILE_EXTERNAL_SNIPPET:
                case AiAgentKnowledgeResourceTypeEnum.STORE_WEBSITE_QUESTION_SNIPPET:
                    if (
                        !snippetHelpCenterQueryData.ids.includes(
                            Number(resource.resourceSetId),
                        )
                    ) {
                        snippetHelpCenterQueryData.ids.push(
                            Number(resource.resourceSetId),
                        )
                    }
                    snippetHelpCenterQueryData.recordIds.push(
                        Number(resource.resourceId),
                    )
                    break

                case AiAgentKnowledgeResourceTypeEnum.ACTION:
                    actionIds.push(Number(resource.resourceId))
                    break
            }
        }
        return {
            faqHelpCenterQueryData,
            guidanceHelpCenterQueryData,
            snippetHelpCenterQueryData,
            actionIds,
            productIds,
        }
    }, [data?.executions])

    const resourceData = useGetKnowledgeResourceData({
        queriesEnabled,
        ...knowledgeReourceQueryData,
        shopName,
        shopType,
        shopIntegrationId: integrationId ?? -1,
    })

    const { knowledgeResources } = useProcessResources(
        data?.executions?.filter((execution) => execution.resources.length > 0),
        shopName,
        hasSurfacedProductsInFeedback,
        resourceData,
    )

    return useMemo(
        () => ({
            isLoading: resourceData?.isLoading,
            knowledgeResources,
        }),
        [resourceData?.isLoading, knowledgeResources],
    )
}

/**
 * Main hook that coordinates the resource fetching and processing
 */
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

    const hasSurfacedProductsInFeedback =
        !!useFlags()[FeatureFlagKey.FeedbackSurfaceProductsUsedByAiAgent]

    const executions = hasSurfacedProductsInFeedback
        ? data?.executions?.map((execution) => {
              return {
                  ...execution,
                  resources: [
                      ...execution.resources,
                      // TESTING ONLY: Add mock products to execution resources
                      mockProductRecommendation,
                      mockProductKnowledge,
                  ],
              }
          })
        : data?.executions

    // Extract helpCenter IDs from the feedback data
    const relatedHelpCenterData = useExtractDistinctHelpCenterFromResources(
        executions as FeedbackExecutionsItem[],
        storeConfiguration,
    )

    const productIds = useExtractDistinctProductIdsFromResources(executions)

    const resourceData = useGetResourceData({
        queriesEnabled,
        faqHelpCenterIds: relatedHelpCenterData.faqHelpCenterIds,
        guidanceHelpCenterIds: relatedHelpCenterData.guidanceHelpCenterIds,
        snippetHelpCenterIds: relatedHelpCenterData.snippetHelpCenterIds,
        productIds,
        shopName: shopName,
        shopType: shopType,
        shopIntegrationId: integrationId ?? -1,
    })

    // Process the fetched data into the final structure
    const enrichedData = useProcessResources(
        executions as FeedbackExecutionsItem[],
        shopName,
        hasSurfacedProductsInFeedback,
        resourceData,
    )

    if (!enrichedData) {
        return null
    }

    return {
        isLoading: resourceData?.isLoading ?? true, // fix for loading
        enrichedData,
        ...resourceData,
    }
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

    const relatedHelpCenterData = resources.reduce(
        (acc, resource) => {
            if (!resource.resourceSetId) {
                return acc
            }

            if (
                resource.resourceType ===
                AiAgentKnowledgeResourceTypeEnum.ARTICLE
            ) {
                acc.faqHelpCenterIds.push(Number(resource.resourceSetId))
            } else if (
                resource.resourceType ===
                AiAgentKnowledgeResourceTypeEnum.GUIDANCE
            ) {
                acc.guidanceHelpCenterIds.push(Number(resource.resourceSetId))
            } else if (
                resource.resourceType ===
                    AiAgentKnowledgeResourceTypeEnum.EXTERNAL_SNIPPET ||
                resource.resourceType ===
                    AiAgentKnowledgeResourceTypeEnum.FILE_EXTERNAL_SNIPPET
            ) {
                acc.snippetHelpCenterIds.push(Number(resource.resourceSetId))
            }
            return acc
        },
        {
            faqHelpCenterIds: [] as number[],
            guidanceHelpCenterIds: [] as number[],
            snippetHelpCenterIds: [] as number[],
        },
    )

    const productIds = resources.reduce((acc, { resourceId, resourceType }) => {
        if (!resourceId) {
            return acc
        }

        if (
            resourceType ===
                AiAgentKnowledgeResourceTypeEnum.PRODUCT_KNOWLEDGE ||
            resourceType ===
                AiAgentKnowledgeResourceTypeEnum.PRODUCT_RECOMMENDATION
        ) {
            acc.push(Number(resourceId))
        }

        return acc
    }, [] as number[])

    const resourceData = useGetResourceData({
        queriesEnabled,
        ...relatedHelpCenterData,
        productIds,
        shopName,
        shopType,
        shopIntegrationId: integrationId ?? -1,
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
                resourceData,
            )
        }),
    }
}
