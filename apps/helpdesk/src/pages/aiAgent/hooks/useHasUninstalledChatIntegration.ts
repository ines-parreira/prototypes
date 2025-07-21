import { useMemo } from 'react'

import { useFetchChatIntegrationsStatusData } from '../Overview/hooks/pendingTasks/useFetchChatIntegrationsStatusData'

export const useHasUninstalledChatIntegration = (
    chatIntegrations: number[],
): boolean => {
    const monitoredChatIntegrations = useMemo(() => {
        return chatIntegrations
    }, [chatIntegrations])

    const { data: chatIntegrationStatus } = useFetchChatIntegrationsStatusData({
        enabled: !!monitoredChatIntegrations.length,
        chatIds: monitoredChatIntegrations,
    })

    const uninstalledChatIds = useMemo(
        () =>
            new Set(
                chatIntegrationStatus
                    ?.filter(({ installed }) => !installed)
                    .map(({ chatId }) => chatId),
            ),
        [chatIntegrationStatus],
    )

    return useMemo(
        () =>
            monitoredChatIntegrations.some((chat) =>
                uninstalledChatIds.has(chat),
            ),
        [monitoredChatIntegrations, uninstalledChatIds],
    )
}
