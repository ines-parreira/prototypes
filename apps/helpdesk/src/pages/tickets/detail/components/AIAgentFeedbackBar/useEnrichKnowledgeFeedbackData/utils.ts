import { useMemo, useRef } from 'react'

import { LDFlagSet } from 'launchdarkly-react-client-sdk'

import {
    FeedbackExecutionsItem,
    FindFeedbackResult,
} from '@gorgias/knowledge-service-types'

import { shopifyAdminBaseUrl } from 'config/integrations/shopify'
import { StoreConfiguration } from 'models/aiAgent/types'
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
import { getLDClient } from 'utils/launchDarkly'

import {
    AiAgentFeedbackTypeEnum,
    AiAgentKnowledgeResourceTypeEnum,
    FreeForm,
    KnowledgeResource,
    SuggestedResource,
    suggestedResourceValueSchema,
} from '../types'
import { getHelpCenterArticleUrl } from '../utils'

export const DEFAULT_STALE_TIME = 10 * 60 * 1000
export const DEFAULT_CACHE_TIME = 10 * 60 * 1000

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

export const useExtractDistinctHelpCenterFromResources = (
    executions?: FeedbackExecutionsItem[],
    storeConfiguration?: StoreConfiguration,
    returnRecordIds?: boolean,
) => {
    return useMemo(() => {
        const output: {
            faqHelpCenterMetadata: { ids: number[]; recordIds?: number[] }
            guidanceHelpCenterMetadata: { ids: number[]; recordIds?: number[] }
            snippetHelpCenterMetadata: { ids: number[]; recordIds?: number[] }
            actionIds: string[]
        } = {
            faqHelpCenterMetadata: storeConfiguration?.helpCenterId
                ? {
                      ids: [storeConfiguration?.helpCenterId],
                      recordIds: returnRecordIds ? [] : undefined,
                  }
                : { ids: [], recordIds: returnRecordIds ? [] : undefined },
            guidanceHelpCenterMetadata: storeConfiguration?.guidanceHelpCenterId
                ? {
                      ids: [storeConfiguration?.guidanceHelpCenterId],
                      recordIds: returnRecordIds ? [] : undefined,
                  }
                : { ids: [], recordIds: returnRecordIds ? [] : undefined },
            snippetHelpCenterMetadata: storeConfiguration?.snippetHelpCenterId
                ? {
                      ids: [storeConfiguration?.snippetHelpCenterId],
                      recordIds: returnRecordIds ? [] : undefined,
                  }
                : { ids: [], recordIds: returnRecordIds ? [] : undefined },
            actionIds: [],
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
                                if (
                                    !output.faqHelpCenterMetadata.ids.includes(
                                        Number(resource.resourceSetId),
                                    )
                                ) {
                                    output.faqHelpCenterMetadata.ids.push(
                                        Number(resource.resourceSetId),
                                    )
                                }
                                if (!output.faqHelpCenterMetadata.recordIds) {
                                    output.faqHelpCenterMetadata.recordIds = []
                                }
                                if (
                                    !output.faqHelpCenterMetadata.recordIds.includes(
                                        Number(resource.resourceId),
                                    )
                                ) {
                                    output.faqHelpCenterMetadata.recordIds.push(
                                        Number(resource.resourceId),
                                    )
                                }
                                break
                            case AiAgentKnowledgeResourceTypeEnum.GUIDANCE:
                                if (
                                    !output.guidanceHelpCenterMetadata.ids.includes(
                                        Number(resource.resourceSetId),
                                    )
                                ) {
                                    output.guidanceHelpCenterMetadata.ids.push(
                                        Number(resource.resourceSetId),
                                    )
                                }
                                if (
                                    !output.guidanceHelpCenterMetadata.recordIds
                                ) {
                                    output.guidanceHelpCenterMetadata.recordIds =
                                        []
                                }
                                if (
                                    !output.guidanceHelpCenterMetadata.recordIds.includes(
                                        Number(resource.resourceId),
                                    )
                                ) {
                                    output.guidanceHelpCenterMetadata.recordIds.push(
                                        Number(resource.resourceId),
                                    )
                                }
                                break
                            case AiAgentKnowledgeResourceTypeEnum.EXTERNAL_SNIPPET:
                            case AiAgentKnowledgeResourceTypeEnum.FILE_EXTERNAL_SNIPPET:
                            case AiAgentKnowledgeResourceTypeEnum.STORE_WEBSITE_QUESTION_SNIPPET:
                                if (
                                    !output.snippetHelpCenterMetadata.ids.includes(
                                        Number(resource.resourceSetId),
                                    )
                                ) {
                                    output.snippetHelpCenterMetadata.ids.push(
                                        Number(resource.resourceSetId),
                                    )
                                }
                                if (
                                    !output.snippetHelpCenterMetadata.recordIds
                                ) {
                                    output.snippetHelpCenterMetadata.recordIds =
                                        []
                                }
                                if (
                                    !output.snippetHelpCenterMetadata.recordIds.includes(
                                        Number(resource.resourceId),
                                    )
                                ) {
                                    output.snippetHelpCenterMetadata.recordIds.push(
                                        Number(resource.resourceId),
                                    )
                                }
                                break

                            case AiAgentKnowledgeResourceTypeEnum.ACTION:
                                if (
                                    !output.actionIds.includes(
                                        resource.resourceId,
                                    )
                                ) {
                                    output.actionIds.push(resource.resourceId)
                                }
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
                        if (
                            !output.faqHelpCenterMetadata.ids.includes(
                                Number(resource.resourceSetId),
                            )
                        ) {
                            output.faqHelpCenterMetadata.ids.push(
                                Number(resource.resourceSetId),
                            )
                        }
                        if (!output.faqHelpCenterMetadata.recordIds) {
                            output.faqHelpCenterMetadata.recordIds = []
                        }
                        if (
                            !output.faqHelpCenterMetadata.recordIds.includes(
                                Number(resource.resourceId),
                            )
                        ) {
                            output.faqHelpCenterMetadata.recordIds.push(
                                Number(resource.resourceId),
                            )
                        }
                        break
                    case AiAgentKnowledgeResourceTypeEnum.GUIDANCE:
                        if (
                            !output.guidanceHelpCenterMetadata.ids.includes(
                                Number(resource.resourceSetId),
                            )
                        ) {
                            output.guidanceHelpCenterMetadata.ids.push(
                                Number(resource.resourceSetId),
                            )
                        }
                        if (!output.guidanceHelpCenterMetadata.recordIds) {
                            output.guidanceHelpCenterMetadata.recordIds = []
                        }
                        if (
                            !output.guidanceHelpCenterMetadata.recordIds.includes(
                                Number(resource.resourceId),
                            )
                        ) {
                            output.guidanceHelpCenterMetadata.recordIds.push(
                                Number(resource.resourceId),
                            )
                        }
                        break
                    case AiAgentKnowledgeResourceTypeEnum.EXTERNAL_SNIPPET:
                    case AiAgentKnowledgeResourceTypeEnum.FILE_EXTERNAL_SNIPPET:
                    case AiAgentKnowledgeResourceTypeEnum.STORE_WEBSITE_QUESTION_SNIPPET:
                        if (
                            !output.snippetHelpCenterMetadata.ids.includes(
                                Number(resource.resourceSetId),
                            )
                        ) {
                            output.snippetHelpCenterMetadata.ids.push(
                                Number(resource.resourceSetId),
                            )
                        }
                        if (!output.snippetHelpCenterMetadata.recordIds) {
                            output.snippetHelpCenterMetadata.recordIds = []
                        }
                        if (
                            !output.snippetHelpCenterMetadata.recordIds.includes(
                                Number(resource.resourceId),
                            )
                        ) {
                            output.snippetHelpCenterMetadata.recordIds.push(
                                Number(resource.resourceId),
                            )
                        }
                        break
                    case AiAgentKnowledgeResourceTypeEnum.ACTION:
                        output.actionIds.push(resource.resourceId)
                        break
                    default:
                        break
                }
            }
        }

        if (!returnRecordIds) {
            return {
                ...output,
                faqHelpCenterMetadata: {
                    ...output.faqHelpCenterMetadata,
                    recordIds: undefined,
                },
                guidanceHelpCenterMetadata: {
                    ...output.guidanceHelpCenterMetadata,
                    recordIds: undefined,
                },
                snippetHelpCenterMetadata: {
                    ...output.snippetHelpCenterMetadata,
                    recordIds: undefined,
                },
            }
        }
        return output
    }, [executions, storeConfiguration, returnRecordIds])
}

export const useActionResources = (
    shopName: string,
    shopType: string,
    queryEnabled = true,
    ids?: string[],
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
        ids,
    )

    return {
        actions: data ?? [],
        isLoading: queryEnabled && isLoading,
    }
}

export const emptyMetadata = {
    title: '',
    content: '',
    isDeleted: true,
    isLoading: false,
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
    flags: LDFlagSet,
    resourceData: {
        articles?: ReturnType<
            typeof useGetMultipleHelpCenterArticleLists
        >['articles']

        guidanceArticles?: ReturnType<
            typeof useMultipleGuidanceArticles
        >['guidanceArticles']

        sourceItems?: ReturnType<
            typeof useMultiplePublicResources
        >['sourceItems']

        ingestedFiles?: ReturnType<
            typeof useGetMultipleFileIngestionSnippets
        >['ingestedFiles']

        actions?: ReturnType<typeof useActionResources>['actions']
        helpCenters?: ReturnType<typeof useGetMultipleHelpCenter>['helpCenters']
        storeWebsiteQuestions?: ReturnType<
            typeof useMultipleStoreWebsiteQuestions
        >['storeWebsiteQuestions']
        products?: NonNullable<
            ReturnType<typeof useGetProductsByIdsFromIntegration>['data']
        >
    } | null,
) => {
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
            const article = articles?.find(
                (article) => article.id === idAsNumber,
            )
            const helpCenter = helpCenters?.find(
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
            const guidance = guidanceArticles?.find(
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
            const snippet = sourceItems?.find(
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
            const storeWebsiteQuestion = storeWebsiteQuestions?.find(
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
                ?.filter((file) => file.ingestionStatus === 'SUCCESSFUL')
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
            const action = actions?.find((action) => action.id === id)
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
            const product = products?.find(
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

export const getResourceType = (
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

export const useProcessResources = (
    executions: FeedbackExecutionsItem[] = [],
    shopName: string,
    hasSurfacedProductsInFeedback: boolean,
    resourceData: {
        isLoading?: boolean
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
        products?: NonNullable<
            ReturnType<typeof useGetProductsByIdsFromIntegration>['data']
        >
    } | null,
) => {
    const flags = getLDClient().allFlags()
    const previousValueRef = useRef<{
        knowledgeResources: KnowledgeResource[]
        suggestedResources: SuggestedResource[]
        freeForm: FreeForm | null
    }>({
        knowledgeResources: [],
        suggestedResources: [],
        freeForm: null,
    })
    const previousResourceDataRef = useRef<typeof resourceData>(resourceData)

    return useMemo(() => {
        if (!resourceData) {
            return previousValueRef.current
        }

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
                    flags,
                    resourceData,
                )

                if (!metadata) {
                    return
                }

                if (resourceData.isLoading && 'isDeleted' in metadata) {
                    metadata.isDeleted = false
                    metadata.isLoading = true
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
                                flags,
                                resourceData.isLoading
                                    ? previousResourceDataRef.current
                                    : resourceData,
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

        output.knowledgeResources.sort((a, b) => {
            const aIndex = knowledgeResourceOrder.indexOf(
                a.resource.resourceType as AiAgentKnowledgeResourceTypeEnum,
            )
            const bIndex = knowledgeResourceOrder.indexOf(
                b.resource.resourceType as AiAgentKnowledgeResourceTypeEnum,
            )

            return aIndex - bIndex
        })

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

        previousValueRef.current = output
        if (!resourceData.isLoading) {
            previousResourceDataRef.current = resourceData
        }
        return output
    }, [
        executions,
        shopName,
        resourceData,
        hasSurfacedProductsInFeedback,
        flags,
    ])
}

export const useExtractDistinctProductIdsFromResources = (
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
