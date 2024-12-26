import axios from 'axios'

import {createMockHttpIntegrationPayload} from 'pages/aiAgent/utils/playground-ticket.util'

import {isProduction, isStaging} from '../../../utils/environment'
import gorgiasAppsAuthInterceptor from '../../../utils/gorgiasAppsAuth'
import {
    AiAgentCustomToneOfVoiceResponse,
    AiAgentInput,
    AiAgentResponse,
    CreatePlaygroundBody,
} from '../../aiAgentPlayground/types'

/**
 * Api Client for AI Agent
 */

export function createBaseUrl(isProd = isProduction(), isStg = isStaging()) {
    if (isProd) {
        return 'https://aiagent.gorgias.help'
    }

    if (isStg) {
        return 'https://aiagent.gorgias.rehab'
    }

    return 'http://localhost:9400'
}

const baseURL = createBaseUrl()

// eslint-disable-next-line no-restricted-properties
export const apiClient = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
})

apiClient.interceptors.request.use(gorgiasAppsAuthInterceptor)

const mockTicket = (body: CreatePlaygroundBody) => {
    return {
        ...createMockHttpIntegrationPayload({
            body_text: body.body_text,
            subject: body.subject,
            domain: body.domain,
            messages: body.messages,
            created_datetime: body.created_datetime,
            channel: body.channel,
            meta: body.meta,
            customer: body.customer,
            from_agent: body.from_agent,
        }),
        _action_serialized_state: body._action_serialized_state,
        _playground_options: body._playground_options,
    }
}

export const submitAiAgentTicket = async (
    body: AiAgentInput,
    abortController?: AbortController
) => {
    return await apiClient.post<AiAgentResponse>(
        '/api/interaction/start',
        body,
        {
            params: {
                playground: true,
            },
            signal: abortController?.signal,
        }
    )
}

export const createContextAndSubmitPlaygroundTicket = async (
    body: CreatePlaygroundBody,
    abortController?: AbortController
) => {
    const mockedTicket = mockTicket(body)
    return await submitAiAgentTicket(mockedTicket, abortController)
}

export const generateCustomToneOfVoicePreview = async (body: AiAgentInput) => {
    return await apiClient.post<AiAgentCustomToneOfVoiceResponse>(
        '/api/interaction/generate-custom-tov-preview',
        body
    )
}

export const createContextAndGenerateCustomToneOfVoicePreview = async (
    body: CreatePlaygroundBody
) => {
    const mockedTicket = mockTicket(body)
    return await generateCustomToneOfVoicePreview(mockedTicket)
}
