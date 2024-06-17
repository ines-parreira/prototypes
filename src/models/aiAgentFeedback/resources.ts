import {apiClient} from 'models/aiAgent/resources/account-configuration'

import {
    SubmitMessageFeedback,
    TicketFeedback,
    DeleteMessageFeedback,
} from './types'

export const getAIAgentTicketMessagesFeedback = async (ticketId: number) => {
    //return await apiClient.get<TicketFeedback>(`/tickets/${ticketId}`)
    return await apiClient.get<TicketFeedback>(`/feedback/ticket/${ticketId}`)
}

export const submitAIAgentTicketMessagesFeedback = async (
    ticketId: number,
    messageId: number,
    feedbackToSubmit: SubmitMessageFeedback
) => {
    return await apiClient.post<SubmitMessageFeedback>(
        `feedback/ticket/${ticketId}/message/${messageId}`,
        feedbackToSubmit
    )
}

export const deleteAIAgentTicketMessagesFeedback = async (
    ticketId: number,
    messageId: number,
    feedbackToDelete: DeleteMessageFeedback
) => {
    return await apiClient.delete<SubmitMessageFeedback>(
        `feedback/ticket/${ticketId}/message/${messageId}`,
        {data: feedbackToDelete}
    )
}
