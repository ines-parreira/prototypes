import { FeatureFlagKey } from '@repo/feature-flags'

import { useFlag } from 'core/flags'
import useAppSelector from 'hooks/useAppSelector'
import { IntegrationType } from 'models/integration/types'
import { AiAgentPaywallView } from 'pages/aiAgent/AiAgentPaywallView'
import { AIAgentWelcomePageView } from 'pages/aiAgent/components/AIAgentWelcomePageView/AIAgentWelcomePageView'
import { AIAgentPaywallFeatures } from 'pages/aiAgent/types'
import useStoreIntegrations from 'pages/automate/common/hooks/useStoreIntegrations'
import { getCurrentAccountState } from 'state/currentAccount/selectors'

type TrialPaywallMiddlewareProps = {
    shopName?: string
}

/**
 * Decides whether to show the AI Agent paywall or the welcome page
 * based on the trial flag and available store integrations.
 */
export function TrialPaywallMiddleware({
    shopName,
}: TrialPaywallMiddlewareProps) {
    const isAiAgentExpandingTrialExperienceForAllEnabled = useFlag(
        FeatureFlagKey.AiAgentExpandingTrialExperienceForAll,
    )

    const storeIntegrations = useStoreIntegrations([IntegrationType.Shopify])
    const currentAccount = useAppSelector(getCurrentAccountState)
    const accountDomain = currentAccount.get('domain')

    const hasIntegrations = storeIntegrations && storeIntegrations.length > 0

    if (!isAiAgentExpandingTrialExperienceForAllEnabled || !hasIntegrations) {
        return (
            <AiAgentPaywallView
                aiAgentPaywallFeature={AIAgentPaywallFeatures.Automate}
            />
        )
    }

    const storeIntegration = storeIntegrations.find(
        (integration) => integration.name === shopName,
    )

    const firstStore = storeIntegration || storeIntegrations[0]

    return (
        <AIAgentWelcomePageView
            accountDomain={accountDomain}
            shopType={firstStore.type}
            shopName={firstStore.name}
        />
    )
}
