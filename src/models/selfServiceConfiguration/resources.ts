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
