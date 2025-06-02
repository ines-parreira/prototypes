import { cloneDeep } from 'lodash'

import { AiAgentFeedbackTypeEnum } from 'pages/tickets/detail/components/AIAgentFeedbackBar/types'
import {
    Components,
    Paths,
} from 'rest_api/knowledge_service_api/client.generated'

export const generateUniqueId = (newData: Components.Schemas.FeedbackDto) => {
    let maxId = 0
    if (!newData.executions) return maxId

    if (newData?.executions) {
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
    (
        params: Paths.FindFeedbackFeedback.QueryParameters,
        data: Components.Schemas.FeedbackUpsertRequestDto,
    ) =>
    (prevData?: Components.Schemas.FeedbackDto) => {
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
                case AiAgentFeedbackTypeEnum.TICKET_FREEFORM: {
                    const newFeedback = {
                        ...baseNewFeedback,
                        targetType: 'TICKET',
                        feedbackType: item.feedbackType,
                        feedbackValue: item.feedbackValue,
                    } as const
                    const freeformExecution = newData?.executions?.find(
                        (execution) =>
                            execution.feedback.find(
                                (f) => f.feedbackType === item.feedbackType,
                            ),
                    )
                    let optimisticallyUpdatedFeedback = false
                    if (freeformExecution) {
                        const feedback = freeformExecution.feedback.find(
                            (f) => f.feedbackType === item.feedbackType,
                        )
                        if (feedback) {
                            feedback.feedbackValue = item.feedbackValue
                            optimisticallyUpdatedFeedback = true
                        } else {
                            freeformExecution.feedback.push(newFeedback)
                        }
                    }

                    if (!optimisticallyUpdatedFeedback) {
                        newData.executions[0]?.feedback.push(newFeedback)
                    }
                    break
                }
                case AiAgentFeedbackTypeEnum.SUGGESTED_RESOURCE: {
                    const newFeedback = {
                        ...baseNewFeedback,
                        id: baseNewFeedback.id ?? generateUniqueId(newData),
                        targetType: item.targetType,
                        feedbackType: item.feedbackType,
                        feedbackValue: item.feedbackValue,
                    } as const
                    const suggestedExecution = newData?.executions?.find(
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
                            suggestedExecution.feedback.push(newFeedback)
                        }
                        optimisticallyUpdatedFeedback = true
                    }
                    if (!optimisticallyUpdatedFeedback) {
                        newData.executions[0]?.feedback.push(newFeedback)
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
                        newData?.executions?.find((execution) =>
                            execution.resources.find(
                                (resource) => resource.id === item.targetId,
                            ),
                        )

                    if (!knowledgeResourceExecution) return

                    const resource = knowledgeResourceExecution?.resources.find(
                        (resource) => resource.feedback?.id === item.id,
                    )

                    if (resource) {
                        if (resource.feedback) {
                            resource.feedback.feedbackValue = item.feedbackValue
                        } else {
                            resource.feedback = newFeedback
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
