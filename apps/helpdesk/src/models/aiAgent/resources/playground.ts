import type { GetTestSessionLogsResponse } from 'models/aiAgentPlayground/types'

import type {
    AiAgentPlaygroundOptions,
    CreateTestSessionResponse,
    PlaygroundExecutions,
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
) => {
    const client = baseUrl ? createApiClient(baseUrl) : aiAgentApiClient
    const response = await client.post<CreateTestSessionResponse>(
        '/api/test-mode-session',
        payload,
    )

    return response.data
}

export const getTestSessionLogs = async (
    testSessionId: string,
    baseUrl?: string,
) => {
    const client = baseUrl ? createApiClient(baseUrl) : aiAgentApiClient
    const response = await client.get<GetTestSessionLogsResponse>(
        `/api/test-mode-session/${testSessionId}/logs`,
    )

    return response.data
}
