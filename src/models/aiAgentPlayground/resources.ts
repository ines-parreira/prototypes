import client from 'models/api/resources'
import {SearchType} from 'models/search/types'
import {
    AiAgentInput,
    CreatePlaygroundRequest,
    CustomerSearchResponse,
    SearchCustomerRequest,
} from './types'

export const createPlayground = async (body: CreatePlaygroundRequest) => {
    return await client.post<AiAgentInput>(
        '/api/automate/ai-agent/playground',
        body
    )
}

export const searchCustomer = async (body: SearchCustomerRequest) => {
    return await client.post<CustomerSearchResponse>('/api/search', {
        type: SearchType.UserChannelEmail,
        query: body.email,
        size: 10,
    })
}
