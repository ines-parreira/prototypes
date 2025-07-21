import { Location } from 'history'

import { FeatureFlagKey } from 'config/featureFlags'
import { getLDClient } from 'utils/launchDarkly'

export const getAiSalesAgentEmailEnabledFlag = () => {
    const launchDarklyClient = getLDClient()
    return !!launchDarklyClient?.variation(
        FeatureFlagKey.AiSalesAgentActivationEmailSettings,
    )
}

export const getAiShoppingAssistantTrialExtensionEnabledFlag = (): number => {
    const launchDarklyClient = getLDClient()
    return (
        launchDarklyClient?.variation(
            FeatureFlagKey.AiShoppingAssistantTrialExtension,
        ) ?? 0
    )
}

export const SalesEarlyAccessUtils = (accountId: number) => ({
    get modalDisplayedAtKey() {
        return `account-${accountId}.aiSalesAgentEarlyAccessModalDisplayedAt`
    },
    hasModalBeenDisplayed() {
        return !!window.localStorage.getItem(this.modalDisplayedAtKey)
    },
    persistModalDisplayedAt() {
        window.localStorage.setItem(
            this.modalDisplayedAtKey,
            new Date().toISOString(),
        )
    },
})

export const FocusActivationModal = {
    searchParam: 'focusActivationModal',
    buildSearchParam(storeName: string = 'true') {
        return `${this.searchParam}=${storeName}`
    },
    extractStoreName(location: Location) {
        const searchParams = new URLSearchParams(location.search)
        const storeName = searchParams.get(this.searchParam)
        if (storeName === 'true') return undefined
        return storeName
    },
}
