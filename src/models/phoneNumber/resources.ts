import {CancelToken} from 'axios'

import client from 'models/api/resources'
import {ApiListResponsePagination} from 'models/api/types'

import {PhoneNumber, PhoneCapabilitiesLimitationsMap} from './types'

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

export const updatePhoneNumber = async (
    phoneNumber: PhoneNumber
): Promise<PhoneNumber> => {
    const res = await client.put(
        `/api/integrations/phone/phone-numbers/${phoneNumber.id}/`,
        phoneNumber
    )
    return res.data as PhoneNumber
}

export const deletePhoneNumber = async (id: number): Promise<void> => {
    await client.delete(`/api/integrations/phone/phone-numbers/${id}/`)
}

export const fetchPhoneCapabilities = async () => {
    const res = await client.get<PhoneCapabilitiesLimitationsMap>(
        '/api/phone-numbers/capabilities-limitations/'
    )
    return res.data
}
