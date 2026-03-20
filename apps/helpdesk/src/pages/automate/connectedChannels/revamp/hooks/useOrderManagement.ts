import { useMemo } from 'react'

import { TicketChannel } from 'business/types/ticket'
import useApplicationsAutomationSettings from 'pages/automate/common/hooks/useApplicationsAutomationSettings'
import useSelfServiceChannels from 'pages/automate/common/hooks/useSelfServiceChannels'
import type { SelfServiceChatChannel } from 'pages/automate/common/hooks/useSelfServiceChatChannels'
import useSelfServiceConfiguration from 'pages/automate/common/hooks/useSelfServiceConfiguration'

type UseOrderManagementParams = {
    shopName: string
    shopType: string
}

export function useOrderManagement({
    shopName,
    shopType,
}: UseOrderManagementParams) {
    const {
        storeIntegration,
        isFetchPending: isSelfServiceConfigurationFetchPending,
    } = useSelfServiceConfiguration(shopType, shopName)

    const channels = useSelfServiceChannels(shopType, shopName)

    const chatChannels = useMemo(
        () =>
            channels.filter(
                (c): c is SelfServiceChatChannel =>
                    c.type === TicketChannel.Chat,
            ),
        [channels],
    )

    const appId = chatChannels[0]?.value.meta.app_id

    const {
        applicationsAutomationSettings,
        isFetchPending: isAutomationSettingsFetchPending,
        handleChatApplicationAutomationSettingsUpdate,
    } = useApplicationsAutomationSettings(appId ? [appId] : [])

    const isStoreConnected = !!storeIntegration

    const isOrderManagementEnabled = useMemo(() => {
        if (!appId) return false
        if (!isStoreConnected) return false

        return (
            applicationsAutomationSettings?.[appId]?.orderManagement?.enabled ??
            false
        )
    }, [appId, isStoreConnected, applicationsAutomationSettings])

    const isLoading =
        isSelfServiceConfigurationFetchPending ||
        isAutomationSettingsFetchPending

    const orderManagementUrl = useMemo(() => {
        if (!shopType || !shopName) return ''
        return `/app/settings/order-management/${shopType}/${shopName}`
    }, [shopType, shopName])

    const handleToggle = (value: boolean) => {
        if (!appId) return

        const applicationAutomationSettings =
            applicationsAutomationSettings?.[appId]

        if (!applicationAutomationSettings) return

        void handleChatApplicationAutomationSettingsUpdate(
            {
                ...applicationAutomationSettings,
                orderManagement: { enabled: value },
            },
            `Order Management ${value ? 'enabled' : 'disabled'}`,
        )
    }

    return {
        enabledInSettings: isStoreConnected,
        isOrderManagementEnabled,
        isDisabled: !isStoreConnected,
        isLoading,
        showStoreRequired: !isStoreConnected,
        orderManagementUrl,
        handleToggle,
    }
}
