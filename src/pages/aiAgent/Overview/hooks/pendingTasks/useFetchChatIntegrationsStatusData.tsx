import { useMemo } from 'react'

import { useQuery } from '@tanstack/react-query'

import useAppSelector from 'hooks/useAppSelector'
import {
    GorgiasChatIntegration,
    IntegrationType,
} from 'models/integration/types'
import { getInstallationStatus } from 'state/integrations/actions'
import { getIntegrationsByType } from 'state/integrations/selectors'

type Args = {
    chatIds: number[]
    enabled: boolean
}
export const useFetchChatIntegrationsStatusData = ({
    enabled,
    chatIds,
}: Args) => {
    const getChatIntegrations = useMemo(
        () =>
            getIntegrationsByType<GorgiasChatIntegration>(
                IntegrationType.GorgiasChat,
            ),
        [],
    )
    const chatIntegrations = useAppSelector(getChatIntegrations)

    const { isLoading, data } = useQuery(['aiAgentChatInstallationStatus'], {
        queryFn: () => {
            const mappedChats = chatIds
                .map((chatId) => {
                    const chat = chatIntegrations.find((i) => i.id === chatId)
                    return {
                        chatId,
                        updatedAt: chat?.updated_datetime,
                        appId: chat?.meta.app_id,
                    }
                })
                .sort((a, b) => {
                    if (!a.updatedAt) {
                        return 1
                    }
                    if (!b.updatedAt) {
                        return -1
                    }

                    return new Date(b.updatedAt).getTime() >
                        new Date(a.updatedAt).getTime()
                        ? -1
                        : 1
                })
                .filter(
                    (
                        chat,
                    ): chat is {
                        chatId: number
                        appId: string
                        updatedAt: string
                    } => !!chat.appId,
                )

            const promises = mappedChats.map(({ chatId, appId }) =>
                getInstallationStatus(appId).then((status) => ({
                    ...status,
                    chatId,
                })),
            )
            return Promise.all(promises)
        },
        enabled,
    })

    return {
        data,
        isLoading,
    }
}

export type ChatIntegrationsStatusData = Exclude<
    Awaited<ReturnType<typeof useFetchChatIntegrationsStatusData>>['data'],
    null | undefined
>
