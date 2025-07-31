import { searchTickets as helpdeskSearchTickets } from '@gorgias/helpdesk-client'

import client from 'models/api/resources'
import { SearchType } from 'models/search/types'

import {
    CustomerSearchResponse,
    GetPlaygroundCustomerRequest,
    GetPlaygroundCustomerResponse,
    SearchCustomerRequest,
} from './types'

export const searchCustomer = async (body: SearchCustomerRequest) => {
    return await client.post<CustomerSearchResponse>('/api/search', {
        type: SearchType.UserChannelEmail,
        query: body.email,
        size: 10,
    })
}

export const searchTickets = async (query: string) => {
    return await helpdeskSearchTickets(
        {
            search: query,
            filters: '',
        },
        { limit: 10 },
    )
}

export const getAiAgentCustomer = async (
    body: GetPlaygroundCustomerRequest,
) => {
    return await client.post<GetPlaygroundCustomerResponse>(
        '/api/automate/ai-agent/playground',
        body,
    )
}
