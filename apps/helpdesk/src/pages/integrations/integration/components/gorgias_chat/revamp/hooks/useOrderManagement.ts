import { useMemo } from 'react'

import type { Map } from 'immutable'

import type { GorgiasChatIntegration } from 'models/integration/types'
import useApplicationsAutomationSettings from 'pages/automate/common/hooks/useApplicationsAutomationSettings'
import useSelfServiceConfiguration from 'pages/automate/common/hooks/useSelfServiceConfiguration'

type UseOrderManagementParams = {
    integration: Map<any, any>
}

export function useOrderManagement({ integration }: UseOrderManagementParams) {
    const gorgiasChatIntegration = integration.toJS() as GorgiasChatIntegration
    const appId = gorgiasChatIntegration?.meta?.app_id
    const shopName = gorgiasChatIntegration?.meta?.shop_name
    const shopType = gorgiasChatIntegration?.meta?.shop_type

    const {
        storeIntegration,
        isFetchPending: isSelfServiceConfigurationFetchPending,
    } = useSelfServiceConfiguration(shopType ?? '', shopName ?? '')

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
