import { FeatureFlagKey } from '@repo/feature-flags'
import { Redirect } from 'react-router-dom'

import useFlag from 'core/flags/hooks/useFlag'
import useAppSelector from 'hooks/useAppSelector'
import { AiAgentPaywallView } from 'pages/aiAgent/AiAgentPaywallView'
import { aiAgentRoutes } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import { AIAgentPaywallFeatures } from 'pages/aiAgent/types'
import StoreIntegrationView from 'pages/automate/common/components/StoreIntegrationView'
import { getHasAutomate } from 'state/billing/selectors'
import { getShopifyIntegrationsSortedByName } from 'state/integrations/selectors'

export const AiAgentRedirect = () => {
    const hasAutomate = useAppSelector(getHasAutomate)
    const storeIntegrations = useAppSelector(getShopifyIntegrationsSortedByName)

    const firstStore = storeIntegrations[0]

    const isAiAgentExpandingTrialExperienceForAllEnabled = useFlag<boolean>(
        FeatureFlagKey.AiAgentExpandingTrialExperienceForAll,
        false,
    )

    if (isAiAgentExpandingTrialExperienceForAllEnabled) {
        if (!hasAutomate) {
            if (!firstStore) {
                return <StoreIntegrationView title="AI Agent" />
            }
            return (
                <AiAgentPaywallView
                    aiAgentPaywallFeature={AIAgentPaywallFeatures.TrialSetup}
                />
            )
        }
        if (!firstStore) {
            return <StoreIntegrationView title="AI Agent" />
        }
        return <Redirect to={aiAgentRoutes.overview} />
    }

    if (!hasAutomate) {
        return (
            <AiAgentPaywallView
                aiAgentPaywallFeature={AIAgentPaywallFeatures.Automate}
            />
        )
    }
    if (!firstStore) {
        return <StoreIntegrationView title="AI Agent" />
    }

    return <Redirect to={aiAgentRoutes.overview} />
}
