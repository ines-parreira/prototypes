import { useCallback, useMemo } from 'react'

import { TicketChannel } from 'business/types/ticket'
import useAppSelector from 'hooks/useAppSelector'
import type { GorgiasChatIntegration } from 'models/integration/types'
import {
    GorgiasChatCreationWizardStatus,
    IntegrationType,
} from 'models/integration/types'
import { getIntegrationsByType } from 'state/integrations/selectors'

import useSelfServiceStoreIntegration, {
    useSelfServiceStoreIntegrationMultiStore,
} from './useSelfServiceStoreIntegration'

export type SelfServiceChatChannel = {
    type: TicketChannel.Chat
    value: GorgiasChatIntegration
}

export const useSelfServiceChatChannelsMultiStore = (
    shopType: string,
    shopNames: string[],
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
    const storeIntegration = useSelfServiceStoreIntegrationMultiStore(
        shopType,
        shopNames,
    )

    const matchesPublishStateFilter = useCallback(
        (integration: GorgiasChatIntegration) =>
            includeDraft ||
            integration.meta.wizard?.status !==
                GorgiasChatCreationWizardStatus.Draft,
        [includeDraft],
    )

    return useMemo<Record<string, SelfServiceChatChannel[]>>(() => {
        return shopNames.reduce<Record<string, SelfServiceChatChannel[]>>(
            (acc, shopName) => {
                const storeIntegrationId = storeIntegration[shopName]?.id
                acc[shopName] = chatIntegrations
                    .filter(
                        (integration) =>
                            integration.meta.shop_integration_id ===
                            storeIntegrationId,
                    )
                    .filter((integration) =>
                        matchesPublishStateFilter(integration),
                    )
                    .map((integration) => ({
                        type: TicketChannel.Chat,
                        value: integration,
                    }))
                return acc
            },
            {},
        )
    }, [
        chatIntegrations,
        matchesPublishStateFilter,
        shopNames,
        storeIntegration,
    ])
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
