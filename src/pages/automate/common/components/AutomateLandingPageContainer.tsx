import useAppSelector from 'hooks/useAppSelector'
import { AiAgentPaywallView } from 'pages/aiAgent/AiAgentPaywallView'
import { AIAgentPaywallFeatures } from 'pages/aiAgent/types'
import useStoreIntegrations from 'pages/automate/common/hooks/useStoreIntegrations'
import { AutomateFeatures } from 'pages/automate/common/types'
import { ErrorBoundary } from 'pages/ErrorBoundary'
import { getHasAutomate } from 'state/billing/selectors'

import AutomateLandingPage from './AutomateLandingPage'
import StoreIntegrationView from './StoreIntegrationView'

const AutomateLandingPageContainer = () => {
    const hasAutomateFeature = useAppSelector(getHasAutomate)
    const storeIntegrations = useStoreIntegrations()

    if (!hasAutomateFeature) {
        return (
            <AiAgentPaywallView
                aiAgentPaywallFeature={AIAgentPaywallFeatures.Automate}
            />
        )
    }

    if (!storeIntegrations.length) {
        return <StoreIntegrationView title={AutomateFeatures.Automate} />
    }

    return (
        <ErrorBoundary
            sentryTags={{
                section: 'automate-landing-page',
                team: 'automate-obs',
            }}
        >
            <AutomateLandingPage />
        </ErrorBoundary>
    )
}

export default AutomateLandingPageContainer
