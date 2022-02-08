import {CancelToken} from 'axios'

import client from 'models/api/resources'
import {ApiListResponsePagination} from 'models/api/types'

import {PhoneNumber} from './types'

export const fetchPhoneNumbers = async (
    cancelToken?: CancelToken
): Promise<ApiListResponsePagination<PhoneNumber[]>> => {
    const res = await client.get<ApiListResponsePagination<PhoneNumber[]>>(
        '/api/integrations/phone/phone-numbers/',
        {cancelToken}
    )
    return res.data
}

export const fetchPhoneNumber = async (id: number): Promise<PhoneNumber> => {
    const res = await client.get<PhoneNumber>(
        `/api/integrations/phone/phone-numbers/${id}/`
    )
    return res.data
}

export const createPhoneNumber = async (
    phoneNumber: Partial<PhoneNumber>
): Promise<PhoneNumber> => {
    const res = await client.post<PhoneNumber>(
        '/api/integrations/phone/phone-numbers/',
        phoneNumber
    )
    return res.data
}

export const deletePhoneNumber = async (id: number): Promise<void> => {
    await client.delete(`/api/integrations/phone/phone-numbers/${id}/`)
}
