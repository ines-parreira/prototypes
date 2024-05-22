import axios from 'axios'
import {isProduction, isStaging} from 'utils/environment'
import {TicketFeedback} from './types'

/**
 * API Client for AI Agent
 */

const baseURL = isProduction()
    ? `https://ai-config.gorgias.help`
    : isStaging()
    ? 'https://ai-config.gorgias.rehab'
    : `http://localhost:8096`

// eslint-disable-next-line no-restricted-properties
export const apiClient = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
})

export const getAIAgentTicketMessagesFeedback = async (ticketId: number) => {
    return await apiClient.get<TicketFeedback>(`/tickets/${ticketId}`)
}
