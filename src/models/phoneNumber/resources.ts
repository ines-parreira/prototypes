import {CancelToken} from 'axios'

import client from 'models/api/resources'
import {ApiListResponsePagination} from 'models/api/types'

import {
    PhoneCapabilitiesLimitationsMap,
    NewPhoneNumber,
    OldPhoneNumber,
} from './types'

export const fetchPhoneNumbers = async (
    cancelToken?: CancelToken
): Promise<ApiListResponsePagination<OldPhoneNumber[]>> => {
    const res = await client.get<ApiListResponsePagination<OldPhoneNumber[]>>(
        '/api/integrations/phone/phone-numbers/',
        {cancelToken}
    )
    return res.data
}

export const fetchNewPhoneNumbers = async (
    cancelToken?: CancelToken
): Promise<ApiListResponsePagination<NewPhoneNumber[]>> => {
    const res = await client.get<ApiListResponsePagination<NewPhoneNumber[]>>(
        '/integrations/phone/phone-numbers-new/',
        {cancelToken}
    )
    return res.data
}

export const fetchPhoneNumber = async (id: number): Promise<OldPhoneNumber> => {
    const res = await client.get<OldPhoneNumber>(
        `/api/integrations/phone/phone-numbers/${id}/`
    )
    return res.data
}

export const createPhoneNumber = async (
    phoneNumber: Partial<OldPhoneNumber>
): Promise<OldPhoneNumber> => {
    const res = await client.post<OldPhoneNumber>(
        '/api/integrations/phone/phone-numbers/',
        phoneNumber
    )
    return res.data
}

export const updatePhoneNumber = async (
    phoneNumber: OldPhoneNumber
): Promise<OldPhoneNumber> => {
    const res = await client.put<OldPhoneNumber>(
        `/api/integrations/phone/phone-numbers/${phoneNumber.id}/`,
        phoneNumber
    )
    return res.data
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
