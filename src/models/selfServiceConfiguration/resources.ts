import client from '../api/resources'

import {
    ApiListResponse,
    SelfServiceConfiguration,
    SelfServiceConfiguration_DEPRECATED,
} from './types'
import {selfServiceConfigurationFromDeprecated} from './utils'

export const fetchSelfServiceConfigurations = async (): Promise<
    ApiListResponse<SelfServiceConfiguration[]>
> => {
    return client
        .get<ApiListResponse<SelfServiceConfiguration_DEPRECATED[]>>(
            `/api/self_service_configurations/`
        )
        .then(({data: apiListResponse}) => ({
            ...apiListResponse,
            data: apiListResponse.data.map(
                selfServiceConfigurationFromDeprecated
            ),
        }))
}

export const fetchSelfServiceConfiguration = async (
    storeIntegrationId: number
): Promise<SelfServiceConfiguration> => {
    return client
        .get<SelfServiceConfiguration_DEPRECATED>(
            `/api/self_service_configurations/${storeIntegrationId}`
        )
        .then(({data}) => selfServiceConfigurationFromDeprecated(data))
}

export const updateSelfServiceConfiguration = async (
    configuration: SelfServiceConfiguration
): Promise<SelfServiceConfiguration> => {
    return client
        .put<SelfServiceConfiguration_DEPRECATED>(
            `/api/self_service_configurations/${configuration.id}`,
            configuration
        )
        .then(({data}) => selfServiceConfigurationFromDeprecated(data))
}
