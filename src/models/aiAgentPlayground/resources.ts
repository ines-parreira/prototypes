import client from 'models/api/resources'

import {CreatePlaygroundRequest, AiAgentInput} from './types'

export const createPlayground = async (body: CreatePlaygroundRequest) => {
    return await client.post<AiAgentInput>(
        '/api/automate/ai-agent/playground',
        body
    )
}
