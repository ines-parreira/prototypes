import {useQuery} from '@tanstack/react-query'

import {useMemo} from 'react'

import useAppSelector from 'hooks/useAppSelector'

import {IntegrationType, GorgiasChatIntegration} from 'models/integration/types'
import {getInstallationStatus} from 'state/integrations/actions'
import {getIntegrationsByType} from 'state/integrations/selectors'

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
                IntegrationType.GorgiasChat
            ),
        []
    )
    const chatIntegrations = useAppSelector(getChatIntegrations)

    const {isLoading, data} = useQuery(['aiAgentChatInstallationStatus'], {
        queryFn: () => {
            const mappedChats = chatIds
                .map((chatId) => ({
                    chatId,
                    appId: chatIntegrations.find((i) => i.id === chatId)?.meta
                        .app_id,
                }))
                .filter(
                    (chat): chat is {chatId: number; appId: string} =>
                        !!chat.appId
                )

            const promises = mappedChats.map(({chatId, appId}) =>
                getInstallationStatus(appId).then((status) => ({
                    ...status,
                    chatId,
                }))
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
