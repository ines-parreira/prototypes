import { useCallback, useMemo } from 'react'

import { TicketChannel } from 'business/types/ticket'
import useAppSelector from 'hooks/useAppSelector'
import {
    GorgiasChatCreationWizardStatus,
    GorgiasChatIntegration,
    IntegrationType,
} from 'models/integration/types'
import { getIntegrationsByType } from 'state/integrations/selectors'

import useSelfServiceStoreIntegration from './useSelfServiceStoreIntegration'

export type SelfServiceChatChannel = {
    type: TicketChannel.Chat
    value: GorgiasChatIntegration
}

const useSelfServiceChatChannels = (
    shopType: string,
    shopName: string,
    includeDraft = false,
) => {
    const getChatIntegrations = useMemo(
        () =>
            getIntegrationsByType<GorgiasChatIntegration>(
                IntegrationType.GorgiasChat,
            ),
        [],
    )

    const chatIntegrations = useAppSelector(getChatIntegrations)
    const storeIntegration = useSelfServiceStoreIntegration(shopType, shopName)
    const storeIntegrationId = storeIntegration?.id

    const matchesPublishStateFilter = useCallback(
        (integration: GorgiasChatIntegration) =>
            includeDraft ||
            integration.meta.wizard?.status !==
                GorgiasChatCreationWizardStatus.Draft,
        [includeDraft],
    )

    return useMemo<SelfServiceChatChannel[]>(
        () =>
            chatIntegrations
                .filter(
                    (integration) =>
                        integration.meta.shop_integration_id ===
                        storeIntegrationId,
                )
                .filter((integration) => matchesPublishStateFilter(integration))
                .map((integration) => ({
                    type: TicketChannel.Chat,
                    value: integration,
                })),
        [chatIntegrations, matchesPublishStateFilter, storeIntegrationId],
    )
}

export default useSelfServiceChatChannels
