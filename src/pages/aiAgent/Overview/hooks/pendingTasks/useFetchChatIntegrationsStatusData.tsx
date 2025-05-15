import { useMemo } from 'react'

import useAppSelector from 'hooks/useAppSelector'
import {
    GorgiasChatIntegration,
    IntegrationType,
} from 'models/integration/types'
import { getChatInstallationStatus } from 'pages/convert/common/hooks/useGetChatInstallationStatus'
import { getIntegrationsByType } from 'state/integrations/selectors'

export const useFetchChatIntegrationsStatusData = () => {
    const getChatIntegrations = useMemo(
        () =>
            getIntegrationsByType<GorgiasChatIntegration>(
                IntegrationType.GorgiasChat,
            ),
        [],
    )
    const chatIntegrations = useAppSelector(getChatIntegrations)

    const result = useMemo(
        () =>
            chatIntegrations.map((integration) => {
                const status = getChatInstallationStatus(integration)
                return {
                    installed: !!(status.installed && status.method),
                    chatId: integration.id,
                }
            }),
        [chatIntegrations],
    )
    return result
}

export type ChatIntegrationsStatusData = ReturnType<
    typeof useFetchChatIntegrationsStatusData
>
