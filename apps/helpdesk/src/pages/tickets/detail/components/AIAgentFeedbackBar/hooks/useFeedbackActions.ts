import type React from 'react'
import { useCallback } from 'react'

import { v4 as uuidv4 } from 'uuid'

import type { FeedbackMutation } from '@gorgias/knowledge-service-types'

import useAppDispatch from 'hooks/useAppDispatch'
import type { StoreConfiguration } from 'models/aiAgent/types'
import type { useUpsertFeedback } from 'models/knowledgeService/mutations'
import type { useGetFeedback } from 'models/knowledgeService/queries'
import type { ChoiceOption } from 'pages/tickets/detail/components/AIAgentFeedbackBar/MissingKnowledgeSelect'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import type { SuggestedResourceValue } from '../types'
import { AiAgentKnowledgeResourceTypeEnum } from '../types'
import type { useEnrichFeedbackData } from '../useEnrichKnowledgeFeedbackData/useEnrichFeedbackData'
import type { useGetAllRelatedResourceData } from '../useEnrichKnowledgeFeedbackData/useGetAllRelatedResourceData'

interface UseFeedbackActionsParams {
    upsertFeedback: ReturnType<typeof useUpsertFeedback>['mutateAsync']
    feedback: ReturnType<typeof useGetFeedback>['data']
    ticketId: number
    storeConfiguration?: StoreConfiguration
    actions: NonNullable<
        ReturnType<typeof useGetAllRelatedResourceData>
    >['actions']
    guidanceArticles: NonNullable<
        ReturnType<typeof useGetAllRelatedResourceData>
    >['guidanceArticles']
    articles: NonNullable<
        ReturnType<typeof useGetAllRelatedResourceData>
    >['articles']
    sourceItems: NonNullable<
        ReturnType<typeof useGetAllRelatedResourceData>
    >['sourceItems']
    ingestedFiles: NonNullable<
        ReturnType<typeof useGetAllRelatedResourceData>
    >['ingestedFiles']
    storeWebsiteQuestions: NonNullable<
        ReturnType<typeof useGetAllRelatedResourceData>
    >['storeWebsiteQuestions']
    setLoadingMutations: React.Dispatch<
        React.SetStateAction<string[] | undefined>
    >
    enrichedData?: Partial<
        NonNullable<ReturnType<typeof useEnrichFeedbackData>>['enrichedData']
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
    ingestedFiles,
    storeWebsiteQuestions,
    enrichedData,
    upsertFeedback,
    setLoadingMutations,
}: UseFeedbackActionsParams) => {
    const dispatch = useAppDispatch()

    const getSuggestedResourceFeedbackValue = useCallback(
        (choice: ChoiceOption) => {
            if (choice.isDeleted) return null
            switch (choice.type) {
                case AiAgentKnowledgeResourceTypeEnum.ACTION: {
                    const action = actions?.find((a) => a.id === choice.value)
                    if (!action) return null
                    return {
                        resourceType: AiAgentKnowledgeResourceTypeEnum.ACTION,
                        resourceId: action.id.toString(),
                        resourceSetId: null,
                        resourceLocale: null,
                    }
                }
                case AiAgentKnowledgeResourceTypeEnum.GUIDANCE: {
                    const guidanceArticle = guidanceArticles?.find(
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
                    const article = articles?.find(
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
                        resourceLocale: null,
                    }
                }
                case AiAgentKnowledgeResourceTypeEnum.STORE_WEBSITE_QUESTION_SNIPPET: {
                    const storeWebsiteQuestion = storeWebsiteQuestions?.find(
                        (a) => a.id.toString() === choice.value,
                    )
                    if (!storeWebsiteQuestion) return null
                    return {
                        resourceType:
                            AiAgentKnowledgeResourceTypeEnum.STORE_WEBSITE_QUESTION_SNIPPET,
                        resourceId: storeWebsiteQuestion.article_id.toString(),
                        resourceSetId:
                            storeConfiguration?.snippetHelpCenterId?.toString(),
                        resourceLocale: null,
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
                            storeConfiguration?.snippetHelpCenterId?.toString() ??
                            null,
                        resourceLocale: null,
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
            ingestedFiles,
            storeWebsiteQuestions,
        ],
    )

    const upsertMissingKnowledge = useCallback(
        async (getFeedbackToUpsert: () => FeedbackMutation[]) => {
            const upsertId = uuidv4()
            try {
                setLoadingMutations((oldValue) => [
                    ...(oldValue ?? []),
                    upsertId,
                ])

                const feedbackToUpsert = getFeedbackToUpsert()
                if (feedbackToUpsert.length > 0) {
                    await upsertFeedback({
                        data: {
                            feedbackToUpsert,
                        },
                    } as unknown as Parameters<typeof upsertFeedback>[0])
                }
            } catch (error) {
                console.error(error)
            } finally {
                setLoadingMutations((oldValue) =>
                    oldValue?.filter((id) => id !== upsertId),
                )
            }
        },
        [upsertFeedback, setLoadingMutations],
    )

    const onSubmitMissingKnowledge = useCallback(
        async (choices: ChoiceOption[]) => {
            const getFeedbackToUpsert = () =>
                choices
                    .map((choice) => {
                        const suggestedResource =
                            enrichedData?.suggestedResources?.find(
                                (resource) => {
                                    switch (choice.type) {
                                        case 'ARTICLE':
                                            return (
                                                resource.parsedResource
                                                    .resourceType ===
                                                    'ARTICLE' &&
                                                resource.parsedResource
                                                    .resourceId ===
                                                    choice.value &&
                                                resource.parsedResource
                                                    .resourceSetId ===
                                                    storeConfiguration?.helpCenterId?.toString()
                                            )
                                        case 'GUIDANCE':
                                            return (
                                                resource.parsedResource
                                                    .resourceType ===
                                                    'GUIDANCE' &&
                                                resource.parsedResource
                                                    .resourceId ===
                                                    choice.value &&
                                                resource.parsedResource
                                                    .resourceSetId ===
                                                    storeConfiguration?.guidanceHelpCenterId?.toString()
                                            )
                                        case 'EXTERNAL_SNIPPET':
                                            return (
                                                resource.parsedResource
                                                    .resourceType ===
                                                    'EXTERNAL_SNIPPET' &&
                                                resource.parsedResource
                                                    .resourceId ===
                                                    choice.value &&
                                                resource.parsedResource
                                                    .resourceSetId ===
                                                    storeConfiguration?.snippetHelpCenterId?.toString()
                                            )
                                        case 'FILE_EXTERNAL_SNIPPET':
                                            return (
                                                resource.parsedResource
                                                    .resourceType ===
                                                    'FILE_EXTERNAL_SNIPPET' &&
                                                resource.parsedResource
                                                    .resourceId ===
                                                    choice.value &&
                                                resource.parsedResource
                                                    .resourceSetId ===
                                                    storeConfiguration?.snippetHelpCenterId?.toString()
                                            )
                                        default:
                                            return (
                                                resource.parsedResource
                                                    .resourceId ===
                                                    choice.value &&
                                                resource.parsedResource
                                                    .resourceType ===
                                                    choice.type
                                            )
                                    }
                                },
                            )

                        const feedbackValue =
                            getSuggestedResourceFeedbackValue(choice)

                        const executionId =
                            suggestedResource?.feedback?.executionId ??
                            feedback?.executions?.[0]?.executionId

                        // should never happen, since we're showing that we're still processing the details of this conversation
                        // if there are no executions
                        if (!executionId) return

                        const id = suggestedResource?.feedback?.id
                        const serializedFeedbackValue = !feedbackValue
                            ? null
                            : JSON.stringify(feedbackValue)

                        if (serializedFeedbackValue === null && !id) return

                        return {
                            id,
                            objectId: ticketId.toString(),
                            objectType: 'TICKET',
                            executionId,
                            targetType: 'TICKET',
                            targetId: ticketId.toString(),
                            feedbackValue: serializedFeedbackValue,
                            feedbackType: 'SUGGESTED_RESOURCE',
                        }
                    })
                    .filter(Boolean) as FeedbackMutation[]

            const feedbackToUpsert = getFeedbackToUpsert()

            if (feedbackToUpsert.length < choices.length) {
                dispatch(
                    notify({
                        message:
                            'Some feedback could not be saved. Please try again or refresh the page.',
                        status: NotificationStatus.Error,
                    }),
                )
            }

            await upsertMissingKnowledge(() => feedbackToUpsert)
        },
        [
            dispatch,
            feedback,
            ticketId,
            storeConfiguration,
            enrichedData,
            getSuggestedResourceFeedbackValue,
            upsertMissingKnowledge,
        ],
    )

    const onSubmitNewMissingKnowledge = useCallback(
        async (resource: SuggestedResourceValue) => {
            const getFeedbackToUpsert = () => {
                const executionId = feedback?.executions?.[0]?.executionId

                // should never happen, since we're showing that we're still processing the details of this conversation
                // if there are no executions
                if (!executionId) return []

                return [
                    {
                        objectId: ticketId.toString(),
                        objectType: 'TICKET',
                        executionId,
                        targetType: 'TICKET',
                        targetId: ticketId.toString(),
                        feedbackValue: JSON.stringify(resource),
                        feedbackType: 'SUGGESTED_RESOURCE',
                    },
                ] as FeedbackMutation[]
            }

            await upsertMissingKnowledge(getFeedbackToUpsert)
        },
        [feedback, ticketId, upsertMissingKnowledge],
    )

    return {
        onSubmitMissingKnowledge,
        onSubmitNewMissingKnowledge,
    }
}
