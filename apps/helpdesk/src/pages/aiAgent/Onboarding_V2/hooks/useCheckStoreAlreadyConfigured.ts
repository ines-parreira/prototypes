import { FeatureFlagKey, useFlagWithLoading } from '@repo/feature-flags'
import { useHistory, useParams } from 'react-router-dom'

import { toast } from '@gorgias/axiom'

import { useAppSelector } from 'hooks/useAppSelector'
import { useFetchAiAgentStoreConfigurationData } from 'pages/aiAgent/Overview/hooks/pendingTasks/useFetchAiAgentStoreConfigurationData'
import { getCurrentDomain } from 'state/currentAccount/selectors'

export const useCheckStoreAlreadyConfigured = (): null => {
    const { shopName, shopType } = useParams<{
        shopName: string
        shopType: string
    }>()
    const accountDomain = useAppSelector(getCurrentDomain)

    const {
        value: isAiAgentOnboardingV3Enabled,
        isLoading: isAiAgentOnboardingV3FlagLoading,
    } = useFlagWithLoading(FeatureFlagKey.AiAgentOnboardingV3, false)

    const { data: storeConfig, isLoading: isFetchingStoreConfiguration } =
        useFetchAiAgentStoreConfigurationData({
            accountDomain,
            storeName: shopName,
            enabled: true,
        })
    const history = useHistory()

    // Return early if still loading
    if (isFetchingStoreConfiguration || isAiAgentOnboardingV3FlagLoading) {
        return null
    }

    // In V3 the wizard is intentionally reused for already-configured stores,
    // so skip the redirect-to-settings guard that V2 relies on.
    if (isAiAgentOnboardingV3Enabled) {
        return null
    }

    if (shopName && storeConfig) {
        toast.error(
            'An Existing Store configuration is already set up. Redirecting to the AI agent settings.',
            { id: 'store-already-configured-error' },
        )
        history.push(`/app/ai-agent/${shopType}/${shopName}/settings`)
    }

    return null
}
