import axios from 'axios'
import {createPlayground} from 'models/aiAgentPlayground/resources'
import {
    AiAgentInput,
    CreatePlaygroundRequest,
} from '../../aiAgentPlayground/types'
import {isProduction, isStaging} from '../../../utils/environment'
import {AiAgentResponse} from '../types'

/**
 * Api Client for AI Agent
 */

const baseURL = isProduction()
    ? `https://ai-agent.gorgias.help`
    : isStaging()
    ? 'https://ai-agent.gorgias.rehab'
    : `http://localhost:8097`

// eslint-disable-next-line no-restricted-properties
const apiClient = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
})

export const submitAiAgentTicket = async (body: AiAgentInput) => {
    return await apiClient.post<AiAgentResponse>('/', body, {
        params: {
            dry_run: true,
        },
    })
}

export const createContextAndSubmitPlaygroundTicket = async (
    body: CreatePlaygroundRequest
) => {
    const context = await createPlayground(body)
    return await submitAiAgentTicket(context.data)
}
