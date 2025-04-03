import { SentryTeam } from 'common/const/sentryTeamNames'
import useAppSelector from 'hooks/useAppSelector'
import { AiAgentPaywallView } from 'pages/aiAgent/AiAgentPaywallView'
import { AIAgentPaywallFeatures } from 'pages/aiAgent/types'
import { ErrorBoundary } from 'pages/ErrorBoundary'
import { getHasAutomate } from 'state/billing/selectors'

import AutomateAllRecommendationsPage from './AutomateAllRecommendationsPage'

const AutomateAllRecommendationsContainer = () => {
    const hasAutomateFeature = useAppSelector(getHasAutomate)

    if (!hasAutomateFeature) {
        return (
            <AiAgentPaywallView
                aiAgentPaywallFeature={AIAgentPaywallFeatures.Automate}
            />
        )
    }

    return (
        <ErrorBoundary
            sentryTags={{
                section: 'automate-all-recommendation',
                team: SentryTeam.CONVAI_KNOWLEDGE,
            }}
        >
            <AutomateAllRecommendationsPage />
        </ErrorBoundary>
    )
}

export default AutomateAllRecommendationsContainer
