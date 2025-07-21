import { getGorgiasChatProtectedApiClient } from 'rest_api/gorgias_chat_protected_api/client'

import { ChatApplicationAutomationSettings } from './types'

export const fetchChatsApplicationAutomationSettings = async (
    applicationIds: string[],
): Promise<ChatApplicationAutomationSettings[]> =>
    Promise.all(applicationIds.map(fetchChatApplicationAutomationSettings))

export const fetchChatApplicationAutomationSettings = async (
    applicationId: string,
): Promise<ChatApplicationAutomationSettings> => {
    const client = await getGorgiasChatProtectedApiClient()

    const { data }: { data: ChatApplicationAutomationSettings } =
        await client.getApplicationAutomationSettings({
            applicationId,
        })

    return data
}

export const upsertChatApplicationAutomationSettings = async (
    applicationId: string,
    payload: Pick<
        ChatApplicationAutomationSettings,
        'articleRecommendation' | 'orderManagement' | 'workflows'
    >,
): Promise<ChatApplicationAutomationSettings> => {
    const client = await getGorgiasChatProtectedApiClient()

    const { data }: { data: ChatApplicationAutomationSettings } =
        await client.upsertApplicationAutomationSettings(
            {
                applicationId: applicationId,
            },
            payload,
        )

    return data
}
