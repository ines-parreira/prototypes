// import {apiClient} from 'models/aiAgent/resources/account-configuration'
import axios from 'axios'
import {
    SubmitMessageFeedback,
    TicketFeedback,
    DeleteMessageFeedback,
} from './types'

const baseURL = `http://dummy.address.forrequestly`

// eslint-disable-next-line no-restricted-properties
export const apiClient = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
})

export const getAIAgentTicketMessagesFeedback = async (ticketId: number) => {
    //return await apiClient.get<TicketFeedback>(`/tickets/${ticketId}`)
    return await apiClient.get<TicketFeedback>(`/tickets/${ticketId}`)
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
