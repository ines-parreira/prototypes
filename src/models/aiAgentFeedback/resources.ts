import {apiClient} from 'models/aiAgent/resources/account-configuration'

import {
    SubmitMessageFeedback,
    TicketFeedback,
    DeleteMessageFeedback,
} from './types'

export const getAIAgentTicketMessagesFeedback = async (
    messageIds: number[]
) => {
    return await apiClient.get<TicketFeedback>(
        `/feedback/messages?ids=${messageIds.join(',')}`
    )
}

export const submitAIAgentTicketMessagesFeedback = async (
    messageId: number,
    feedbackToSubmit: SubmitMessageFeedback
) => {
    return await apiClient.post<SubmitMessageFeedback>(
        `feedback/messages/${messageId}`,
        feedbackToSubmit
    )
}

export const deleteAIAgentTicketMessagesFeedback = async (
    messageId: number,
    feedbackToDelete: DeleteMessageFeedback
) => {
    return await apiClient.delete<SubmitMessageFeedback>(
        `feedback/messages/${messageId}`,
        {data: feedbackToDelete}
    )
}
