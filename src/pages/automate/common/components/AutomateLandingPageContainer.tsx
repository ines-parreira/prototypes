import useAppSelector from 'hooks/useAppSelector'
import { ErrorBoundary } from 'pages/ErrorBoundary'
import { getHasAutomate } from 'state/billing/selectors'

import useStoreIntegrations from '../hooks/useStoreIntegrations'
import { AutomateFeatures } from '../types'
import AutomateLandingPage from './AutomateLandingPage'
import AutomatePaywallView from './AutomatePaywallView'
import StoreIntegrationView from './StoreIntegrationView'

const AutomateLandingPageContainer = () => {
    const hasAutomateFeature = useAppSelector(getHasAutomate)

    const storeIntegrations = useStoreIntegrations()

    if (!hasAutomateFeature) {
        return (
            <AutomatePaywallView automateFeature={AutomateFeatures.Automate} />
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
