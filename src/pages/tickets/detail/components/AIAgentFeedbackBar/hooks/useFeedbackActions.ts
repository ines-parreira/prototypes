import React, { useCallback } from 'react'

import { v4 as uuidv4 } from 'uuid'

import { StoreConfiguration } from 'models/aiAgent/types'
import { useUpsertFeedback } from 'models/knowledgeService/mutations'
import { useGetFeedback } from 'models/knowledgeService/queries'
import { ChoiceOption } from 'pages/tickets/detail/components/AIAgentFeedbackBar/MissingKnowledgeSelect'
import { useEnrichFeedbackData } from 'pages/tickets/detail/components/AIAgentFeedbackBar/useEnrichFeedbackData'
import { Components } from 'rest_api/knowledge_service_api/client.generated'

import { AiAgentKnowledgeResourceTypeEnum } from '../types'

interface UseFeedbackActionsParams {
    upsertFeedback: ReturnType<typeof useUpsertFeedback>['mutateAsync']
    feedback: ReturnType<typeof useGetFeedback>['data']
    ticketId: number
    storeConfiguration?: StoreConfiguration
    actions: ReturnType<typeof useEnrichFeedbackData>['actions']
    guidanceArticles: ReturnType<
        typeof useEnrichFeedbackData
    >['guidanceArticles']
    articles: ReturnType<typeof useEnrichFeedbackData>['articles']
    sourceItems: ReturnType<typeof useEnrichFeedbackData>['sourceItems']
    macros: ReturnType<typeof useEnrichFeedbackData>['macros']
    ingestedFiles: ReturnType<typeof useEnrichFeedbackData>['ingestedFiles']
    enrichedData: ReturnType<typeof useEnrichFeedbackData>['enrichedData']
    setLoadingMutations: React.Dispatch<
        React.SetStateAction<string[] | undefined>
    >
}

export const useFeedbackActions = ({
    feedback,
    ticketId,
    storeConfiguration,
    actions,
    guidanceArticles,
    articles,
    sourceItems,
    macros,
    ingestedFiles,
    enrichedData,
    upsertFeedback,
    setLoadingMutations,
}: UseFeedbackActionsParams) => {
    const getSuggestedResourceFeedbackValue = useCallback(
        (choice: ChoiceOption) => {
            if (choice.isDeleted) return null
            switch (choice.type) {
                case AiAgentKnowledgeResourceTypeEnum.ACTION: {
                    const action = actions.find((a) => a.id === choice.value)
                    if (!action) return null
                    return {
                        resourceType: AiAgentKnowledgeResourceTypeEnum.ACTION,
                        resourceId: action.id,
                    }
                }
                case AiAgentKnowledgeResourceTypeEnum.GUIDANCE: {
                    const guidanceArticle = guidanceArticles.find(
                        (a) => a.id.toString() === choice.value,
                    )
                    if (!guidanceArticle) return null
                    return {
                        resourceType: AiAgentKnowledgeResourceTypeEnum.GUIDANCE,
                        resourceId: guidanceArticle.id.toString(),
                        resourceSetId:
                            storeConfiguration?.guidanceHelpCenterId?.toString(),
                        resourceLocale: guidanceArticle.locale,
                    }
                }
                case AiAgentKnowledgeResourceTypeEnum.ARTICLE: {
                    const article = articles.find(
                        (a) => a.id.toString() === choice.value,
                    )
                    if (!article) return null
                    return {
                        resourceType: AiAgentKnowledgeResourceTypeEnum.ARTICLE,
                        resourceId: article.id.toString(),
                        resourceSetId:
                            storeConfiguration?.helpCenterId?.toString(),
                        resourceLocale: article.translation.locale,
                    }
                }
                case AiAgentKnowledgeResourceTypeEnum.EXTERNAL_SNIPPET: {
                    const sourceItem = sourceItems?.find(
                        (a) => a.id.toString() === choice.value,
                    )
                    if (!sourceItem) return null
                    return {
                        resourceType:
                            AiAgentKnowledgeResourceTypeEnum.EXTERNAL_SNIPPET,
                        resourceId: sourceItem.id.toString(),
                        resourceSetId:
                            storeConfiguration?.snippetHelpCenterId?.toString(),
                    }
                }
                case AiAgentKnowledgeResourceTypeEnum.MACRO: {
                    const macro = macros.find(
                        (a) => a.id?.toString() === choice.value,
                    )
                    if (!macro) return null
                    return {
                        resourceType: AiAgentKnowledgeResourceTypeEnum.MACRO,
                        resourceId: macro.id?.toString(),
                    }
                }
                case AiAgentKnowledgeResourceTypeEnum.FILE_EXTERNAL_SNIPPET: {
                    const file = ingestedFiles?.find(
                        (a) => a.id.toString() === choice.value,
                    )
                    if (!file) return null
                    return {
                        resourceType:
                            AiAgentKnowledgeResourceTypeEnum.FILE_EXTERNAL_SNIPPET,
                        resourceId: file.id.toString(),
                        resourceSetId:
                            storeConfiguration?.snippetHelpCenterId?.toString(),
                    }
                }
                default:
                    return null
            }
        },
        [
            storeConfiguration,
            actions,
            guidanceArticles,
            articles,
            sourceItems,
            macros,
            ingestedFiles,
        ],
    )

    const onSubmitMissingKnowledge = useCallback(
        async (choices: ChoiceOption[]) => {
            const upsertId = uuidv4()
            try {
                setLoadingMutations((oldValue) => [
                    ...(oldValue ?? []),
                    upsertId,
                ])
                const feedbackToUpsert = choices.map((choice) => {
                    const suggestedResource =
                        enrichedData.suggestedResources.find((resource) => {
                            switch (choice.type) {
                                case 'ARTICLE':
                                    return (
                                        resource.parsedResource.resourceType ===
                                            'ARTICLE' &&
                                        resource.parsedResource.resourceId ===
                                            choice.value &&
                                        resource.parsedResource
                                            .resourceSetId ===
                                            storeConfiguration?.helpCenterId?.toString()
                                    )
                                case 'GUIDANCE':
                                    return (
                                        resource.parsedResource.resourceType ===
                                            'GUIDANCE' &&
                                        resource.parsedResource.resourceId ===
                                            choice.value &&
                                        resource.parsedResource
                                            .resourceSetId ===
                                            storeConfiguration?.guidanceHelpCenterId?.toString()
                                    )
                                case 'EXTERNAL_SNIPPET':
                                    return (
                                        resource.parsedResource.resourceType ===
                                            'EXTERNAL_SNIPPET' &&
                                        resource.parsedResource.resourceId ===
                                            choice.value &&
                                        resource.parsedResource
                                            .resourceSetId ===
                                            storeConfiguration?.snippetHelpCenterId?.toString()
                                    )
                                case 'FILE_EXTERNAL_SNIPPET':
                                    return (
                                        resource.parsedResource.resourceType ===
                                            'FILE_EXTERNAL_SNIPPET' &&
                                        resource.parsedResource.resourceId ===
                                            choice.value &&
                                        resource.parsedResource
                                            .resourceSetId ===
                                            storeConfiguration?.snippetHelpCenterId?.toString()
                                    )
                                default:
                                    return (
                                        resource.parsedResource.resourceId ===
                                            choice.value &&
                                        resource.parsedResource.resourceType ===
                                            choice.type
                                    )
                            }
                        })

                    const feedbackValue =
                        getSuggestedResourceFeedbackValue(choice)

                    return {
                        id: suggestedResource?.feedback?.id,
                        objectId: ticketId.toString(),
                        objectType: 'TICKET',
                        executionId:
                            suggestedResource?.feedback?.executionId ??
                            feedback?.executions?.[0]?.executionId ??
                            ticketId,
                        targetType: 'TICKET',
                        targetId: ticketId.toString(),
                        feedbackValue: !feedbackValue
                            ? null
                            : JSON.stringify(feedbackValue),
                        feedbackType: 'SUGGESTED_RESOURCE',
                    }
                })
                if (feedbackToUpsert.length > 0) {
                    await upsertFeedback({
                        feedbackToUpsert,
                    } as unknown as Components.Schemas.FeedbackUpsertRequestDto)
                }
            } catch (error) {
                console.error(error)
            } finally {
                setLoadingMutations((oldValue) =>
                    oldValue?.filter((id) => id !== upsertId),
                )
            }
        },
        [
            feedback,
            ticketId,
            upsertFeedback,
            storeConfiguration,
            enrichedData,
            getSuggestedResourceFeedbackValue,
            setLoadingMutations,
        ],
    )
    return {
        onSubmitMissingKnowledge,
    }
}
