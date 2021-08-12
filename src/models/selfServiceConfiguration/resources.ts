import client from '../api/resources'

import {ApiListResponse, SelfServiceConfiguration} from './types'

export const fetchSelfServiceConfigurations = async () => {
    const res = await client.get<ApiListResponse<SelfServiceConfiguration[]>>(
        `/api/self_service_configurations/`
    )
    return res.data
}

export const fetchSelfServiceConfiguration = async (
    shopifyIntegrationId: string
) => {
    const res = await client.get<SelfServiceConfiguration>(
        `/api/self_service_configurations/${shopifyIntegrationId}`
    )
    return res.data
}

export const updateSelfServiceConfiguration = async (
    configuration: SelfServiceConfiguration
) => {
    const res = await client.put<SelfServiceConfiguration>(
        `/api/self_service_configurations/${configuration.id}`,
        configuration
    )
    return res.data
}
