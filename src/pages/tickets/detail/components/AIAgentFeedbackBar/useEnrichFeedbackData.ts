import { useEffect, useMemo } from 'react'

import _flatten from 'lodash/flatten'

import { shopifyAdminBaseUrl } from 'config/integrations/shopify'
import { StoreConfiguration } from 'models/aiAgent/types'
import { KnowledgeReasoningResource } from 'models/aiAgentFeedback/types'
import {
    useGetMultipleFileIngestion,
    useGetMultipleHelpCenter,
    useGetMultipleHelpCenterArticleLists,
} from 'models/helpCenter/queries'
import { useGetAICompatibleMacros } from 'models/macro/queries'
import { useGetStoreWorkflowsConfigurations } from 'models/workflows/queries'
import { getAiAgentNavigationRoutes } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import { useMultipleGuidanceArticles } from 'pages/aiAgent/hooks/useGuidanceArticles'
import { useMultipleStoreWebsiteQuestions } from 'pages/aiAgent/hooks/useMultipleStoreWebsiteQuestions'
import { useMultiplePublicResources } from 'pages/aiAgent/hooks/usePublicResources'
import {
    getArticleUrl,
    getHelpCenterDomain,
} from 'pages/settings/helpCenter/utils/helpCenter.utils'
import {
    AiAgentFeedbackTypeEnum,
    AiAgentKnowledgeResourceTypeEnum,
    FreeForm,
    KnowledgeResource,
    SuggestedResource,
    suggestedResourceValueSchema,
} from 'pages/tickets/detail/components/AIAgentFeedbackBar/types'
import { Components } from 'rest_api/knowledge_service_api/client.generated'
import { getLDClient } from 'utils/launchDarkly'

const DEFAULT_STALE_TIME = 10 * 60 * 1000
const DEFAULT_CACHE_TIME = 10 * 60 * 1000

const knowledgeResourceOrder = [
    AiAgentKnowledgeResourceTypeEnum.GUIDANCE,
    AiAgentKnowledgeResourceTypeEnum.ACTION,
    AiAgentKnowledgeResourceTypeEnum.ARTICLE,
    AiAgentKnowledgeResourceTypeEnum.MACRO,
    AiAgentKnowledgeResourceTypeEnum.EXTERNAL_SNIPPET,
    AiAgentKnowledgeResourceTypeEnum.FILE_EXTERNAL_SNIPPET,
    AiAgentKnowledgeResourceTypeEnum.ORDER,
]

/**
 * Extracts distinct help center IDs from resources
 */
const useExtractDistinctHelpCenterFromResources = (
    executions?: Components.Schemas.FeedbackDto['executions'],
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
 * Fetches macro resources based on extracted resource data
 */
const useMacroResources = (ticketId: number, queryEnabled = true) => {
    const macrosQuery = useGetAICompatibleMacros({
        enabled: queryEnabled,
        staleTime: DEFAULT_STALE_TIME,
        cacheTime: DEFAULT_CACHE_TIME,
    })

    const macros = useMemo(() => {
        return _flatten(
            macrosQuery.data?.pages.map((page) => page.data.data) ?? [],
        )
    }, [macrosQuery.data])

    useEffect(() => {
        if (macrosQuery.hasNextPage) {
            void macrosQuery.fetchNextPage({
                pageParam: { ticket_id: ticketId },
            })
        }
    }, [
        macrosQuery.hasNextPage,
        macrosQuery.fetchNextPage,
        ticketId,
        macrosQuery.data?.pageParams,
        macrosQuery,
    ])

    return {
        macros,
        isLoading: macrosQuery.isLoading,
    }
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
        isLoading,
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
    {
        articles,
        guidanceArticles,
        sourceItems,
        ingestedFiles,
        macros,
        actions,
        helpCenters,
        storeWebsiteQuestions,
    }: {
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
            ReturnType<typeof useGetMultipleFileIngestion>['ingestedFiles']
        >
        macros: NonNullable<ReturnType<typeof useMacroResources>['macros']>
        actions: NonNullable<ReturnType<typeof useActionResources>['actions']>
        helpCenters: NonNullable<
            ReturnType<typeof useGetMultipleHelpCenter>['helpCenters']
        >
        storeWebsiteQuestions: NonNullable<
            ReturnType<
                typeof useMultipleStoreWebsiteQuestions
            >['storeWebsiteQuestions']
        >
    },
) => {
    const flags = getLDClient().allFlags()
    const aiAgentRoutes = shopName
        ? getAiAgentNavigationRoutes(shopName, flags)
        : undefined

    const idAsNumber = parseInt(id)

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
                getArticleUrl({
                    domain: getHelpCenterDomain(helpCenter),
                    locale: article.translation.locale,
                    slug: article.translation.slug,
                    articleId: article.id,
                    unlistedId: article.translation.article_unlisted_id,
                    isUnlisted:
                        article.translation.visibility_status === 'UNLISTED',
                })

            return article
                ? {
                      title: article.translation.title ?? '',
                      content: article.translation.content ?? '',
                      url: articleUrl ?? '',
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
                  }
                : emptyMetadata
        }
        case AiAgentKnowledgeResourceTypeEnum.EXTERNAL_SNIPPET: {
            const snippet = sourceItems.find(
                (snippet) => snippet.id === idAsNumber,
            )
            if (snippet) {
                return {
                    title: snippet.url ?? '',
                    content: snippet.url ?? '',
                    url: snippet.url ?? '',
                }
            }
            const storeWebsiteQuestion = storeWebsiteQuestions.find(
                (question) => question.article_id === idAsNumber,
            )
            if (storeWebsiteQuestion) {
                return {
                    title: storeWebsiteQuestion.title,
                    content: storeWebsiteQuestion.title,
                    url: aiAgentRoutes?.pagesContentDetail(
                        storeWebsiteQuestion.id,
                    ),
                }
            }

            return emptyMetadata
        }
        case AiAgentKnowledgeResourceTypeEnum.FILE_EXTERNAL_SNIPPET: {
            const fileSnippet = ingestedFiles
                .filter((file) => file.status === 'SUCCESSFUL')
                .find((fileSnippet) => fileSnippet.id === idAsNumber)
            return fileSnippet
                ? {
                      title: fileSnippet.filename,
                      content: fileSnippet.filename ?? '',
                      url:
                          fileSnippet.google_storage_url ||
                          aiAgentRoutes?.knowledge ||
                          '',
                  }
                : emptyMetadata
        }
        case AiAgentKnowledgeResourceTypeEnum.MACRO: {
            const macro = macros.find((macro) => macro.id === idAsNumber)
            return macro
                ? {
                      title: macro.name ?? '',
                      content: macro.intent ?? '',
                      url: `/app/settings/macros/${id}`,
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
        default: {
            return emptyMetadata
        }
    }
}

/**
 * Merges all fetched resources into final enriched data structure
 */
const useProcessResources = (
    executions: Components.Schemas.FeedbackDto['executions'] = [],
    shopName: string,
    {
        articles,
        guidanceArticles,
        sourceItems,
        ingestedFiles,
        macros,
        actions,
        helpCenters,
        storeWebsiteQuestions,
    }: {
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
            ReturnType<typeof useGetMultipleFileIngestion>['ingestedFiles']
        >
        macros: NonNullable<ReturnType<typeof useMacroResources>['macros']>
        actions: NonNullable<ReturnType<typeof useActionResources>['actions']>
        helpCenters: NonNullable<
            ReturnType<typeof useGetMultipleHelpCenter>['helpCenters']
        >
        storeWebsiteQuestions: NonNullable<
            ReturnType<
                typeof useMultipleStoreWebsiteQuestions
            >['storeWebsiteQuestions']
        >
    },
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

        executions.forEach((execution) => {
            execution.resources.forEach((resource) => {
                let metadata = getResourceMetadata(
                    {
                        id: resource.resourceId,
                        title: resource.resourceTitle,
                        type: resource.resourceType as AiAgentKnowledgeResourceTypeEnum,
                    },
                    shopName,
                    {
                        articles,
                        guidanceArticles,
                        sourceItems,
                        ingestedFiles,
                        macros,
                        actions,
                        helpCenters,
                        storeWebsiteQuestions,
                    },
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
                    metadata: metadata,
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
                                {
                                    articles,
                                    guidanceArticles,
                                    sourceItems,
                                    ingestedFiles,
                                    macros,
                                    actions,
                                    helpCenters,
                                    storeWebsiteQuestions,
                                },
                            )
                            if (!metadata) {
                                return
                            }
                            output.suggestedResources.push({
                                executionId: execution.executionId,
                                feedback: feedback,
                                parsedResource,
                                metadata: metadata,
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
    }, [
        executions,
        articles,
        guidanceArticles,
        sourceItems,
        ingestedFiles,
        macros,
        actions,
        shopName,
        helpCenters,
        storeWebsiteQuestions,
    ])
}

export const useGetResourceData = ({
    queriesEnabled = true,
    faqHelpCenterIds,
    guidanceHelpCenterIds,
    snippetHelpCenterIds,
    ticketId,
    shopName,
    shopType,
}: {
    queriesEnabled: boolean
    faqHelpCenterIds: number[]
    guidanceHelpCenterIds: number[]
    snippetHelpCenterIds: number[]
    ticketId: number
    shopName: string
    shopType: string
}) => {
    // Fetch articles from multiple FAQ help centers
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

    const { helpCenters, isLoading: isHelpCentersLoading } =
        useGetMultipleHelpCenter(faqHelpCenterIds, {
            enabled: queriesEnabled && faqHelpCenterIds.length > 0,
            refetchOnWindowFocus: false,
            staleTime: DEFAULT_STALE_TIME,
            cacheTime: DEFAULT_CACHE_TIME,
        })

    // Fetch guidance articles
    const { guidanceArticles, isGuidanceArticleListLoading } =
        useMultipleGuidanceArticles(guidanceHelpCenterIds, {
            enabled: queriesEnabled,
            staleTime: DEFAULT_STALE_TIME,
            cacheTime: DEFAULT_CACHE_TIME,
        })

    // Fetch snippets from multiple help centers
    const { sourceItems, isSourceItemsListLoading } =
        useMultiplePublicResources({
            helpCenterIds: snippetHelpCenterIds,
            queryOptionsOverrides: {
                enabled: queriesEnabled && snippetHelpCenterIds.length > 0,
                staleTime: DEFAULT_STALE_TIME,
                cacheTime: DEFAULT_CACHE_TIME,
            },
        })

    // Fetch file snippets from multiple help centers
    const { ingestedFiles, isLoading: isIngesting } =
        useGetMultipleFileIngestion(
            snippetHelpCenterIds,
            {}, // No specific file IDs needed
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

    // Fetch macros
    const { macros, isLoading: isMacrosLoading } = useMacroResources(
        ticketId,
        queriesEnabled,
    )

    // Fetch actions
    const { actions, isLoading: isActionsLoading } = useActionResources(
        shopName ?? '',
        shopType ?? '',
        queriesEnabled,
    )

    // Determine overall loading state
    const isLoading =
        isArticlesLoading ||
        isMacrosLoading ||
        isGuidanceArticleListLoading ||
        isSourceItemsListLoading ||
        isActionsLoading ||
        isIngesting ||
        isHelpCentersLoading ||
        isStoreWebsiteQuestionsLoading

    return {
        isLoading,
        articles,
        guidanceArticles,
        sourceItems,
        ingestedFiles,
        macros,
        actions,
        helpCenters,
        storeWebsiteQuestions,
    }
}

/**
 * Main hook that coordinates the resource fetching and processing
 */
export const useEnrichFeedbackData = ({
    data,
    storeConfiguration,
    ticketId,
}: {
    data?: Components.Schemas.FeedbackDto
    ticketId: number
    storeConfiguration?: StoreConfiguration
}) => {
    const shopName = storeConfiguration?.storeName
    const shopType = storeConfiguration?.shopType
    const queriesEnabled = !!shopName && !!shopType && !!data

    // Extract helpCenter IDs from the feedback data
    const relatedHelpCenterData = useExtractDistinctHelpCenterFromResources(
        data?.executions,
        storeConfiguration,
    )

    const {
        articles,
        guidanceArticles,
        sourceItems,
        ingestedFiles,
        macros,
        actions,
        helpCenters,
        storeWebsiteQuestions,
        isLoading,
    } = useGetResourceData({
        queriesEnabled,
        faqHelpCenterIds: relatedHelpCenterData.faqHelpCenterIds,
        guidanceHelpCenterIds: relatedHelpCenterData.guidanceHelpCenterIds,
        snippetHelpCenterIds: relatedHelpCenterData.snippetHelpCenterIds,
        ticketId,
        shopName: storeConfiguration?.storeName ?? '',
        shopType: storeConfiguration?.shopType ?? '',
    })

    // Process the fetched data into the final structure
    const enrichedData = useProcessResources(
        data?.executions,
        storeConfiguration?.storeName ?? '',
        {
            articles,
            guidanceArticles,
            sourceItems: sourceItems ?? [],
            storeWebsiteQuestions,
            ingestedFiles: ingestedFiles ?? [],
            macros,
            actions,
            helpCenters,
        },
    )

    return {
        isLoading,
        enrichedData,
        actions,
        macros,
        articles,
        guidanceArticles,
        sourceItems,
        ingestedFiles,
        helpCenters,
        storeWebsiteQuestions,
    }
}

export const useGetResourcesReasoningMetadata = ({
    resources,
    ticketId,
    storeConfiguration,
    queriesEnabled = true,
}: {
    resources: KnowledgeReasoningResource[]
    ticketId: number
    storeConfiguration?: StoreConfiguration
    queriesEnabled?: boolean
}) => {
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

    const {
        articles,
        guidanceArticles,
        sourceItems,
        ingestedFiles,
        macros,
        actions,
        helpCenters,
        storeWebsiteQuestions,
        isLoading,
    } = useGetResourceData({
        queriesEnabled,
        ...relatedHelpCenterData,
        ticketId,
        shopName: storeConfiguration?.storeName ?? '',
        shopType: storeConfiguration?.shopType ?? '',
    })

    return {
        isLoading,
        data: resources.map((resource) => {
            return getResourceMetadata(
                {
                    id: resource.resourceId,
                    title: resource.resourceTitle,
                    type: resource.resourceType,
                },
                storeConfiguration?.storeName ?? '',
                {
                    articles,
                    guidanceArticles,
                    sourceItems,
                    ingestedFiles,
                    macros,
                    actions,
                    helpCenters,
                    storeWebsiteQuestions,
                },
            )
        }),
    }
}
