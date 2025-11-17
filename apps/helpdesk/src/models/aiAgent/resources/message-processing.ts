import { isProduction, isStaging } from '@repo/utils'
import axios from 'axios'

import { createMockHttpIntegrationPayload } from 'pages/aiAgent/Playground/utils/playground-ticket.util'

import gorgiasAppsAuthInterceptor from '../../../utils/gorgiasAppsAuth'
import type {
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

export const createApiClient = (baseUrl: string) => {
    // eslint-disable-next-line no-restricted-properties
    const client = axios.create({
        baseURL: baseUrl,
        headers: {
            'Content-Type': 'application/json',
        },
    })
    client.interceptors.request.use(gorgiasAppsAuthInterceptor)
    return client
}

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
            channel_integration_id: body.channel_integration_id,
        }),
        _action_serialized_state: body._action_serialized_state,
        _playground_options: body._playground_options,
    }
}

export const submitAiAgentTicket = async (
    body: AiAgentInput,
    sessionId?: string,
    abortController?: AbortController,
    baseUrl?: string,
) => {
    const client = baseUrl ? createApiClient(baseUrl) : apiClient
    return await client.post<AiAgentResponse>('/api/interaction/start', body, {
        params: {
            playground: true,
            test_mode_session_id: sessionId,
        },
        signal: abortController?.signal,
    })
}

export const createContextAndSubmitPlaygroundTicket = async (
    body: CreatePlaygroundBody,
    sessionId?: string,
    abortController?: AbortController,
    baseUrl?: string,
) => {
    const mockedTicket = mockTicket(body)
    return await submitAiAgentTicket(
        mockedTicket,
        sessionId,
        abortController,
        baseUrl,
    )
}

export const generateCustomToneOfVoicePreview = async (
    body: AiAgentInput,
    baseUrl?: string,
) => {
    const client = baseUrl ? createApiClient(baseUrl) : apiClient
    return await client.post<AiAgentCustomToneOfVoiceResponse>(
        '/api/interaction/generate-custom-tov-preview',
        body,
    )
}

export const createContextAndGenerateCustomToneOfVoicePreview = async (
    body: CreatePlaygroundBody,
    baseUrl?: string,
) => {
    const mockedTicket = mockTicket(body)
    return await generateCustomToneOfVoicePreview(mockedTicket, baseUrl)
}
