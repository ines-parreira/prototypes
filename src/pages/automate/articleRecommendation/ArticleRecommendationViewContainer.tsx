import { useFlags } from 'launchdarkly-react-client-sdk'

import { FeatureFlagKey } from 'config/featureFlags'
import useAppSelector from 'hooks/useAppSelector'
import { AiAgentPaywallView } from 'pages/aiAgent/AiAgentPaywallView'
import { AIAgentPaywallFeatures } from 'pages/aiAgent/types'
import AutomatePaywallView from 'pages/automate/common/components/AutomatePaywallView'
import { AutomateFeatures } from 'pages/automate/common/types'
import { getHasAutomate } from 'state/billing/selectors'

import ArticleRecommendationView from './ArticleRecommendationView'

const ArticleRecommendationViewContainer = () => {
    const hasAutomate = useAppSelector(getHasAutomate)
    const hasNewAutomatePaywall =
        useFlags()[FeatureFlagKey.StandaloneAiAgentAutomatePaywall]

    if (!hasAutomate) {
        return hasNewAutomatePaywall ? (
            <AiAgentPaywallView
                aiAgentPaywallFeature={AIAgentPaywallFeatures.Automate}
            />
        ) : (
            <AutomatePaywallView automateFeature={AutomateFeatures.Automate} />
        )
    }

    return <ArticleRecommendationView />
}

export default ArticleRecommendationViewContainer
