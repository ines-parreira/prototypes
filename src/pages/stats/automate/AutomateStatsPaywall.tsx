import { useFlags } from 'launchdarkly-react-client-sdk'

import { FeatureFlagKey } from 'config/featureFlags'
import useAppSelector from 'hooks/useAppSelector'
import { AiAgentPaywallView } from 'pages/aiAgent/AiAgentPaywallView'
import { AIAgentPaywallFeatures } from 'pages/aiAgent/types'
import AutomatePaywallView from 'pages/automate/common/components/AutomatePaywallView'
import { AutomateFeatures } from 'pages/automate/common/types'
import { ErrorBoundary } from 'pages/ErrorBoundary'
import { AutomateOverview } from 'pages/stats/automate/overview/AutomateOverview'
import { getHasAutomate } from 'state/billing/selectors'

const AutomateStatsPaywall: React.FC = () => {
    const hasAutomate = useAppSelector(getHasAutomate)
    const hasNewAutomatePaywall =
        useFlags()[FeatureFlagKey.StandaloneAiAgentAutomatePaywall]

    return (
        <ErrorBoundary
            sentryTags={{
                section: 'automate-stats',
                team: 'automate-obs',
            }}
        >
            {!hasAutomate ? (
                hasNewAutomatePaywall ? (
                    <AiAgentPaywallView
                        aiAgentPaywallFeature={AIAgentPaywallFeatures.Automate}
                    />
                ) : (
                    <AutomatePaywallView
                        automateFeature={AutomateFeatures.AutomateStats}
                    />
                )
            ) : (
                <AutomateOverview />
            )}
        </ErrorBoundary>
    )
}

export default AutomateStatsPaywall
