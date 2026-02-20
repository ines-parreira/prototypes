import type { GetTestSessionLogsResponse } from 'models/aiAgentPlayground/types'
import { AI_AGENT_V3_QUERY_PARAM } from 'pages/aiAgent/PlaygroundV2/constants'

import type {
    AiAgentPlaygroundOptions,
    CreateTestSessionResponse,
    PlaygroundExecutions,
    TestModeSessionMessagePayload,
} from '../types'
import { apiClient as configurationApiClient } from './configuration'
import {
    apiClient as aiAgentApiClient,
    createApiClient,
} from './message-processing'

/**
 * Endpoints "/accounts/<gorgiasDomain>/stores/<storeName>/playground/executions-count"
 */
export const getPlaygroundExecutions = async (
    accountDomain: string,
    storeName: string,
) => {
    return await configurationApiClient.get<PlaygroundExecutions>(
        `/config/accounts/${accountDomain}/stores/${storeName}/playground/executions-count`,
    )
}

export const createTestSession = async (
    baseUrl?: string,
    payload: AiAgentPlaygroundOptions | {} = {},
    useV3: boolean = false,
) => {
    const client = baseUrl ? createApiClient(baseUrl) : aiAgentApiClient
    const response = await client.post<CreateTestSessionResponse>(
        `/api/test-mode-session?${AI_AGENT_V3_QUERY_PARAM}=${useV3}`,
        payload,
    )

    return response.data
}

export const submitTestSessionMessage = async (
    baseUrl?: string,
    payload: TestModeSessionMessagePayload | {} = {},
) => {
    const client = baseUrl ? createApiClient(baseUrl) : aiAgentApiClient
    const response = await client.post(
        '/api/test-mode-session/message',
        payload,
    )
    return response.data
}

export const getTestSessionLogs = async (
    testSessionId: string,
    baseUrl?: string,
    useV3: boolean = false,
) => {
    const client = baseUrl ? createApiClient(baseUrl) : aiAgentApiClient
    const response = await client.get<GetTestSessionLogsResponse>(
        `/api/test-mode-session/${testSessionId}/logs?${AI_AGENT_V3_QUERY_PARAM}=${useV3}`,
    )

    return response.data
}
