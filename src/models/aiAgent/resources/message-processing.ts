import axios from 'axios'
import {createPlayground} from 'models/aiAgentPlayground/resources'
import {
    createMockClientPayload,
    createMockHttpIntegrationPayload,
} from 'pages/automate/aiAgent/utils/new-customer-playground.util'
import {
    AiAgentInput,
    AiAgentResponse,
    CreatePlaygroundBody,
} from '../../aiAgentPlayground/types'
import {isProduction, isStaging} from '../../../utils/environment'
import gorgiasAppsAuthInterceptor from '../../../utils/gorgiasAppsAuth'

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

apiClient.interceptors.request.use(gorgiasAppsAuthInterceptor)

export const submitAiAgentTicket = async (
    body: AiAgentInput,
    abortController?: AbortController
) => {
    return await apiClient.post<AiAgentResponse>('/', body, {
        params: {
            playground: true,
        },
        signal: abortController?.signal,
    })
}

export const createContextAndSubmitPlaygroundTicket = async (
    body: CreatePlaygroundBody,
    abortController?: AbortController
) => {
    let context

    if (body.use_mock_context) {
        context = {
            data: createMockHttpIntegrationPayload({
                body_text: body.body_text,
                subject: body.subject,
                domain: body.domain,
                messages: body.messages,
                created_datetime: body.created_datetime,
                integration: {
                    id: body.email_integration_id,
                    address: body.email_integration_address,
                },
            }),
        }
    } else {
        const payload = createMockClientPayload(body)
        context = {data: (await createPlayground(payload)).data}
    }

    return await submitAiAgentTicket(context.data, abortController)
}
