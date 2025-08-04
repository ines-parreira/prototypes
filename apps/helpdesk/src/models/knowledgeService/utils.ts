import { cloneDeep } from 'lodash'

import {
    client,
    FeedbackExecutionsItemFeedbackItem,
    FeedbackExecutionsItemResourcesItemFeedback,
    FeedbackUpsertRequest,
    FindFeedbackParams,
    FindFeedbackResult,
    setDefaultConfig,
} from '@gorgias/knowledge-service-client'

import { AiAgentFeedbackTypeEnum } from 'pages/tickets/detail/components/AIAgentFeedbackBar/types'
import { isProduction, isStaging } from 'utils/environment'
import gorgiasAppsAuthInterceptor from 'utils/gorgiasAppsAuth'

export function getKsApiBaseURL(): string {
    return isProduction()
        ? `https://knowledge-service.gorgias.help`
        : isStaging()
          ? 'https://knowledge-service.gorgias.rehab'
          : `http://localhost:9500`
}

export const setKSDefaultConfig = () =>
    setDefaultConfig(async () => {
        client.client.interceptors.request.use(gorgiasAppsAuthInterceptor)
        return {
            baseURL: getKsApiBaseURL(),
            headers: {
                'Content-Type': 'application/json',
            },
        }
    })

export const generateUniqueId = (newData: FindFeedbackResult['data']) => {
    let maxId = 0
    if (!newData.executions) return maxId

    if (newData.executions) {
        for (const execution of newData.executions) {
            for (const feedback of execution.feedback) {
                if (typeof feedback.id === 'number' && feedback.id > maxId) {
                    maxId = feedback.id
                }
            }
        }
    }
    return maxId + 1
}

export const optimisticallyUpdateFeedback =
    (params: FindFeedbackParams, data: FeedbackUpsertRequest) =>
    (prevData?: FindFeedbackResult) => {
        if (!prevData) return prevData
        const newData = cloneDeep(prevData)

        for (const item of data.feedbackToUpsert) {
            if (!item) continue

            const baseNewFeedback = {
                id: item.id,
                objectId: params.objectId,
                executionId: item.executionId,
                submittedBy: 0,
                createdDatetime: new Date().toISOString(),
                updatedDatetime: new Date().toISOString(),
                objectType: item.objectType,
                targetId: item.targetId,
            }

            switch (item.feedbackType) {
                case AiAgentFeedbackTypeEnum.TICKET_RATING:
                case AiAgentFeedbackTypeEnum.TICKET_BAD_INTERACTION_REASON:
                case AiAgentFeedbackTypeEnum.TICKET_FREEFORM: {
                    if (item.feedbackValue === null) {
                        for (const execution of newData.data.executions) {
                            const index = execution.feedback.findIndex(
                                (f) => f.id === item.id,
                            )
                            if (index !== -1) {
                                execution.feedback.splice(index, 1)
                            }
                        }
                        continue
                    }
                    const newFeedback = {
                        ...baseNewFeedback,
                        targetType: 'TICKET',
                        feedbackType: item.feedbackType,
                        feedbackValue: item.feedbackValue,
                    } as FeedbackExecutionsItemFeedbackItem
                    const ticketLevelFeedbackExecution =
                        newData.data.executions.find((execution) =>
                            execution.feedback.find(
                                (f) => f.feedbackType === item.feedbackType,
                            ),
                        )
                    let optimisticallyUpdatedFeedback = false
                    if (ticketLevelFeedbackExecution) {
                        optimisticallyUpdatedFeedback = true
                        let feedback =
                            ticketLevelFeedbackExecution.feedback.find(
                                (f) => f.feedbackType === item.feedbackType,
                            )
                        if (
                            item.feedbackType ===
                            'TICKET_BAD_INTERACTION_REASON'
                        ) {
                            feedback = undefined
                        }
                        if (feedback) {
                            feedback.feedbackValue = item.feedbackValue
                        } else {
                            ticketLevelFeedbackExecution.feedback.push(
                                newFeedback,
                            )
                        }
                    }
                    if (!optimisticallyUpdatedFeedback) {
                        newData.data.executions[0]?.feedback.push(newFeedback)
                    }
                    break
                }
                case AiAgentFeedbackTypeEnum.SUGGESTED_RESOURCE: {
                    const newFeedback = {
                        ...baseNewFeedback,
                        id:
                            baseNewFeedback.id ??
                            generateUniqueId(newData.data),
                        targetType: item.targetType,
                        feedbackType: item.feedbackType,
                        feedbackValue: item.feedbackValue,
                    } as const
                    const suggestedExecution = newData.data.executions.find(
                        (execution) =>
                            execution.executionId === item.executionId,
                    )
                    let optimisticallyUpdatedFeedback = false
                    if (suggestedExecution) {
                        const feedback = suggestedExecution.feedback.find(
                            (f) =>
                                f.feedbackType === item.feedbackType &&
                                f.id === item.id,
                        )
                        if (feedback) {
                            if (item.feedbackValue) {
                                feedback.feedbackValue = item.feedbackValue
                            } else {
                                suggestedExecution.feedback =
                                    suggestedExecution.feedback.filter(
                                        (f) => f.id !== feedback.id,
                                    )
                            }
                        } else {
                            suggestedExecution.feedback.push(
                                newFeedback as FeedbackExecutionsItemFeedbackItem,
                            )
                        }
                        optimisticallyUpdatedFeedback = true
                    }
                    if (!optimisticallyUpdatedFeedback) {
                        newData.data.executions[0]?.feedback.push(
                            newFeedback as FeedbackExecutionsItemFeedbackItem,
                        )
                    }
                    break
                }
                case AiAgentFeedbackTypeEnum.KNOWLEDGE_RESOURCE_BINARY: {
                    const newFeedback = {
                        ...baseNewFeedback,
                        targetType: item.targetType,
                        feedbackType: item.feedbackType,
                        feedbackValue: item.feedbackValue,
                    } as const

                    const knowledgeResourceExecution =
                        newData.data.executions.find((execution) =>
                            execution.resources.find(
                                (resource) => resource.id === item.targetId,
                            ),
                        )

                    if (!knowledgeResourceExecution) continue
                    const resource = knowledgeResourceExecution.resources.find(
                        (resource) =>
                            resource.feedback
                                ? resource.feedback?.id === item.id
                                : resource.id === item.targetId,
                    )

                    if (resource) {
                        if (resource.feedback) {
                            resource.feedback.feedbackValue = item.feedbackValue
                        } else {
                            resource.feedback =
                                newFeedback as FeedbackExecutionsItemResourcesItemFeedback
                        }
                    }
                    break
                }
                default:
                    break
            }
        }

        return newData
    }
