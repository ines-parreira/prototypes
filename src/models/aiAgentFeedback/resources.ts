import {apiClient} from 'models/aiAgent/resources/account-configuration'

import {ResourceSection} from 'pages/tickets/detail/components/AIAgentFeedbackBar/types'

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
    feedbackToSubmit: SubmitMessageFeedback,
    // we call this function with resourceSection in order to pass it to `onSuccess`or `onError` callbacks of `mutateAsync`, so it is needed to be here for type checking
    __resourceSection?: ResourceSection
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
