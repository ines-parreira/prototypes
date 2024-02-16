import {stringify} from 'qs'
import client from 'models/api/resources'

import {StoreMapping} from './types'

export const listStoreMappings = async (
    integrationIds: number[]
): Promise<StoreMapping[]> => {
    const res = await client.get<{data: StoreMapping[]}>(
        '/api/automate/store-mappings',
        {
            params: {integration_ids: integrationIds},
            paramsSerializer: (params) => {
                return stringify(params, {arrayFormat: 'repeat'})
            },
        }
    )
    return res.data.data
}

export const createStoreMapping = async (
    storeMapping: StoreMapping
): Promise<StoreMapping> => {
    const res = await client.post<StoreMapping>(
        '/api/automate/store-mappings',
        storeMapping
    )
    return res.data
}

export const updateStoreMapping = async (
    storeMapping: StoreMapping,
    integrationId: number
): Promise<StoreMapping> => {
    const res = await client.put<StoreMapping>(
        `/api/automate/store-mappings/${integrationId}/`,
        storeMapping
    )
    return res.data
}

export const deleteStoreMapping = async (
    integrationId: number
): Promise<void> => {
    await client.delete(`/api/automate/store-mappings/${integrationId}/`)
}
