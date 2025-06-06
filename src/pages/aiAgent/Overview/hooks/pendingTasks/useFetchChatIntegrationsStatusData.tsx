import { useCallback, useMemo } from 'react'

import { useQuery } from '@tanstack/react-query'

import useAppSelector from 'hooks/useAppSelector'
import {
    GorgiasChatIntegration,
    IntegrationType,
} from 'models/integration/types'
import { InstallationStatus } from 'rest_api/gorgias_chat_protected_api/types'
import { getInstallationStatuses } from 'state/integrations/actions'
import { getIntegrationsByType } from 'state/integrations/selectors'

const sortByUpdatedAt = <T extends { updatedAt?: string }>(items: T[]): T[] => {
    return items.sort((a, b) => {
        if (!a.updatedAt) return 1
        if (!b.updatedAt) return -1
        return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
    })
}

type Args = {
    chatIds: number[]
    enabled: boolean
    refetchOnWindowFocus?: boolean
}

type ChatInstallationStatus = InstallationStatus & {
    chatId?: number
}

type MappedChat = {
    chatId: number
    appId: string
    updatedAt: string
}

export const useFetchChatIntegrationsStatusData = ({
    enabled,
    chatIds,
    refetchOnWindowFocus = true,
}: Args) => {
    const getChatIntegrations = useMemo(
        () =>
            getIntegrationsByType<GorgiasChatIntegration>(
                IntegrationType.GorgiasChat,
            ),
        [],
    )
    const chatIntegrations = useAppSelector(getChatIntegrations)

    const mappedChats = useMemo(() => {
        const chatsWithData = chatIds
            .map((chatId) => {
                const chat = chatIntegrations.find((i) => i.id === chatId)
                return {
                    chatId,
                    updatedAt: chat?.updated_datetime,
                    appId: chat?.meta.app_id,
                }
            })
            .filter((chat): chat is MappedChat => !!chat.appId)

        return sortByUpdatedAt(chatsWithData)
    }, [chatIds, chatIntegrations])

    const appIdToChat = useMemo(() => {
        return new Map(mappedChats.map((chat) => [+chat.appId, chat]))
    }, [mappedChats])

    const queryFn = useCallback(async (): Promise<ChatInstallationStatus[]> => {
        if (mappedChats.length === 0) return []

        const { installationStatuses } = await getInstallationStatuses()
        if (!installationStatuses?.length) return []

        const statusByAppId = new Map(
            installationStatuses.map((status) => [
                status.applicationId,
                status,
            ]),
        )

        return mappedChats
            .map((chat) => statusByAppId.get(+chat.appId))
            .filter((status): status is InstallationStatus => !!status)
            .map((status) => ({
                ...status,
                chatId: appIdToChat.get(status.applicationId)?.chatId,
            }))
    }, [mappedChats, appIdToChat])

    const { isLoading, isFetched, data } = useQuery({
        queryKey: [
            'aiAgentChatInstallationStatuses',
            { chatIds: chatIds.sort() },
        ],
        queryFn,
        enabled,
        refetchOnWindowFocus,
    })

    return {
        data,
        isLoading: enabled && isLoading,
        isFetched,
    }
}

export type ChatIntegrationsStatusData = Exclude<
    Awaited<ReturnType<typeof useFetchChatIntegrationsStatusData>>['data'],
    null | undefined
>
