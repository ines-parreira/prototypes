import { useFlags } from 'launchdarkly-react-client-sdk'

import { FeatureFlagKey } from 'config/featureFlags'
import useAppSelector from 'hooks/useAppSelector'
import { AiAgentPaywallView } from 'pages/aiAgent/AiAgentPaywallView'
import { AIAgentPaywallFeatures } from 'pages/aiAgent/types'
import { AutomateFeatures } from 'pages/automate/common/types'
import { ErrorBoundary } from 'pages/ErrorBoundary'
import { getHasAutomate } from 'state/billing/selectors'

import AutomateAllRecommendationsPage from './AutomateAllRecommendationsPage'
import AutomatePaywallView from './AutomatePaywallView'

const AutomateAllRecommendationsContainer = () => {
    const hasAutomateFeature = useAppSelector(getHasAutomate)
    const hasNewAutomatePaywall =
        useFlags()[FeatureFlagKey.StandaloneAiAgentAutomatePaywall]

    if (!hasAutomateFeature) {
        return hasNewAutomatePaywall ? (
            <AiAgentPaywallView
                aiAgentPaywallFeature={AIAgentPaywallFeatures.Automate}
            />
        ) : (
            <AutomatePaywallView automateFeature={AutomateFeatures.Automate} />
        )
    }

    return (
        <ErrorBoundary
            sentryTags={{
                section: 'automate-all-recommendation',
                team: 'automate-obs',
            }}
        >
            <AutomateAllRecommendationsPage />
        </ErrorBoundary>
    )
}

export default AutomateAllRecommendationsContainer
