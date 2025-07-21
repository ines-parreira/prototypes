import { useEffect, useMemo } from 'react'

import _flatten from 'lodash/flatten'

import {
    FeedbackExecutionsItem,
    FindAiReasoningAiReasoningResult,
    FindFeedbackResult,
} from '@gorgias/knowledge-service-types'

import { shopifyAdminBaseUrl } from 'config/integrations/shopify'
import { StoreConfiguration } from 'models/aiAgent/types'
import { KnowledgeReasoningResource } from 'models/aiAgentFeedback/types'
import {
    useGetMultipleFileIngestionSnippets,
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
    AiAgentKnowledgeResourceTypeEnum.MACRO,
    AiAgentKnowledgeResourceTypeEnum.STORE_WEBSITE_QUESTION_SNIPPET,
    AiAgentKnowledgeResourceTypeEnum.ORDER,
    AiAgentKnowledgeResourceTypeEnum.EXTERNAL_SNIPPET,
    AiAgentKnowledgeResourceTypeEnum.FILE_EXTERNAL_SNIPPET,
]

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
 * Fetches macro resources based on extracted resource data
 */
const useMacroResources = (queryEnabled: boolean) => {
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
            void macrosQuery.fetchNextPage()
        }
    }, [
        macrosQuery.hasNextPage,
        macrosQuery.fetchNextPage,
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
        macros,
        actions,
        helpCenters,
        storeWebsiteQuestions,
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
    }, [executions, shopName, resourceData])
}

export const useGetResourceData = ({
    queriesEnabled = true,
    faqHelpCenterIds,
    guidanceHelpCenterIds,
    snippetHelpCenterIds,
    shopName,
    shopType,
}: {
    queriesEnabled: boolean
    faqHelpCenterIds: number[]
    guidanceHelpCenterIds: number[]
    snippetHelpCenterIds: number[]
    shopName: string
    shopType: string
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

    const { macros, isLoading: isMacrosLoading } =
        useMacroResources(queriesEnabled)

    const { actions, isLoading: isActionsLoading } = useActionResources(
        shopName,
        shopType,
        queriesEnabled && !!shopName && !!shopType,
    )

    const isLoading =
        isArticlesLoading ||
        isMacrosLoading ||
        isGuidanceArticleListLoading ||
        isSourceItemsListLoading ||
        isActionsLoading ||
        isIngesting ||
        isHelpCentersLoading ||
        isStoreWebsiteQuestionsLoading

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
            macros,
            actions,
            helpCenters,
            storeWebsiteQuestions,
        }
    }, [
        isLoading,
        articles,
        guidanceArticles,
        sourceItems,
        ingestedFiles,
        macros,
        actions,
        helpCenters,
        storeWebsiteQuestions,
    ])
}

export const useGetKnowledgeResourceData = (props: {
    queriesEnabled: boolean
    faqHelpCenterQueryData: { ids: number[]; recordIds: number[] }
    guidanceHelpCenterQueryData: { ids: number[]; recordIds: number[] }
    snippetHelpCenterQueryData: { ids: number[]; recordIds: number[] }
    macroIds: number[]
    actionIds: number[]
    shopName: string
    shopType: string
}) => {
    const {
        queriesEnabled,
        faqHelpCenterQueryData,
        guidanceHelpCenterQueryData,
        snippetHelpCenterQueryData,
        macroIds,
        actionIds,
        shopName,
        shopType,
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

    const { macros, isLoading: isMacrosLoading } = useMacroResources(
        queriesEnabled && macroIds.length > 0,
    )

    const { actions, isLoading: isActionsLoading } = useActionResources(
        shopName,
        shopType,
        queriesEnabled && !!shopName && !!shopType && actionIds.length > 0,
    )

    const isLoading =
        isArticlesLoading ||
        isMacrosLoading ||
        isGuidanceArticleListLoading ||
        isSourceItemsListLoading ||
        isActionsLoading ||
        isIngesting ||
        isHelpCentersLoading ||
        isStoreWebsiteQuestionsLoading

    if (isLoading) {
        return null
    }

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

export const useGetKnowledgeResourceMetadata = ({
    data,
    storeConfiguration,
    queriesEnabled,
}: {
    data?: FindFeedbackResult['data']
    storeConfiguration?: StoreConfiguration
    queriesEnabled: boolean
}) => {
    const shopName = storeConfiguration?.storeName ?? ''
    const shopType = storeConfiguration?.shopType ?? ''

    const knowledgeReourceQueryData = useMemo(() => {
        const knowledgeResources = data?.executions?.flatMap(
            (execution) => execution.resources,
        )
        const {
            faqHelpCenterQueryData,
            guidanceHelpCenterQueryData,
            snippetHelpCenterQueryData,
            macroIds,
            actionIds,
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
            macroIds: [] as number[],
            actionIds: [] as number[],
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
                case AiAgentKnowledgeResourceTypeEnum.MACRO:
                    macroIds.push(Number(resource.resourceId))
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
            macroIds,
            actionIds,
        }
    }, [data?.executions])

    const resourceData = useGetKnowledgeResourceData({
        queriesEnabled,
        ...knowledgeReourceQueryData,
        shopName,
        shopType,
    })

    const { knowledgeResources } = useProcessResources(
        data?.executions?.filter((execution) => execution.resources.length > 0),
        shopName,
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
    const queriesEnabled = !!shopName && !!shopType && !!data

    // Extract helpCenter IDs from the feedback data
    const relatedHelpCenterData = useExtractDistinctHelpCenterFromResources(
        data?.executions,
        storeConfiguration,
    )

    const {
        knowledgeResources,
        isLoading: isKnowledgeResourceMetadataLoading,
    } = useGetKnowledgeResourceMetadata({
        data,
        storeConfiguration,
        queriesEnabled,
    })

    const resourceData = useGetResourceData({
        queriesEnabled,
        faqHelpCenterIds: relatedHelpCenterData.faqHelpCenterIds,
        guidanceHelpCenterIds: relatedHelpCenterData.guidanceHelpCenterIds,
        snippetHelpCenterIds: relatedHelpCenterData.snippetHelpCenterIds,
        shopName: shopName,
        shopType: shopType,
    })

    // Process the fetched data into the final structure
    const enrichedData = useProcessResources(
        data?.executions,
        shopName,
        resourceData,
    )

    if (!enrichedData) {
        return null
    }

    return {
        isLoading: resourceData?.isLoading,
        isKnowledgeResourceMetadataLoading,
        enrichedData: {
            ...enrichedData,
            knowledgeResources,
        },
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

    const resourceData = useGetResourceData({
        queriesEnabled,
        ...relatedHelpCenterData,
        shopName,
        shopType,
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
