import axios from 'axios'
import {createPlayground} from 'models/aiAgentPlayground/resources'
import {createMockHttpIntegrationPayload} from 'pages/automate/aiAgent/utils/new-customer-playground.util'
import {
    AiAgentInput,
    AiAgentResponse,
    CreatePlaygroundRequest,
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

export const submitAiAgentTicket = async (body: AiAgentInput) => {
    return await apiClient.post<AiAgentResponse>('/', body, {
        params: {
            playground: true,
        },
    })
}

export const createContextAndSubmitPlaygroundTicket = async (
    body: CreatePlaygroundRequest
) => {
    let context

    if (body.use_mock_context) {
        context = {
            data: createMockHttpIntegrationPayload({
                body_text: body.body_text,
                domain: body.domain,
                created_datetime: new Date().toISOString(),
                integration: {
                    id: body.email_integration_id,
                    address: body.email_integration_address,
                },
            }),
        }
    } else {
        context = {data: (await createPlayground(body)).data}
    }

    return await submitAiAgentTicket(context.data)
}
