import client from 'models/api/resources'
import {SearchType} from 'models/search/types'
import {SearchCustomerRequest, CustomerSearchResponse} from './types'

export const searchCustomer = async (body: SearchCustomerRequest) => {
    return await client.post<CustomerSearchResponse>('/api/search', {
        type: SearchType.UserChannelEmail,
        query: body.email,
        size: 10,
    })
}
