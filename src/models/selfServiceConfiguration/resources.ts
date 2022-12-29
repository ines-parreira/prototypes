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
    shopifyIntegrationId: string
): Promise<SelfServiceConfiguration> => {
    return client
        .get<SelfServiceConfiguration_DEPRECATED>(
            `/api/self_service_configurations/${shopifyIntegrationId}`
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

export type ChatHelpCenterConfiguration = {
    id: number
    help_center_id: number
    chat_application_id: number
    enabled: boolean
}

export const fetchChatHelpCenterConfiguration = async (
    chatApplicationId: number
) => {
    const res = await client.get<ChatHelpCenterConfiguration>(
        `/api/chat_help_center/${chatApplicationId}`
    )
    return res.data
}

export const updateChatHelpCenterConfiguration = async ({
    chatApplicationId,
    helpCenterId,
    enabled,
    id,
}: {
    chatApplicationId: number
    helpCenterId: number
    enabled: boolean
    id: number
}) => {
    const res = await client.put<ChatHelpCenterConfiguration>(
        `/api/chat_help_center/${chatApplicationId}`,
        {
            helpCenterId,
            enabled,
            id,
        }
    )
    return res.data
}

export const createChatHelpCenterConfiguration = async ({
    chatApplicationId,
    helpCenterId,
}: {
    chatApplicationId: number
    helpCenterId: number
}) => {
    const res = await client.post<ChatHelpCenterConfiguration>(
        `/api/chat_help_center/`,
        {
            helpCenterId,
            chatApplicationId: chatApplicationId,
        }
    )
    return res.data
}
