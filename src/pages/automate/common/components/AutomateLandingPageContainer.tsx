import React from 'react'
import useAppSelector from 'hooks/useAppSelector'

import {
    getHasAutomate,
    getHasLegacyAutomateFeatures,
} from 'state/billing/selectors'
import {ErrorBoundary} from 'pages/ErrorBoundary'

import {AutomateFeatures} from '../types'
import useStoreIntegrations from '../hooks/useStoreIntegrations'
import StoreIntegrationView from './StoreIntegrationView'
import AutomatePaywallView from './AutomatePaywallView'
import AutomateLandingPage from './AutomateLandingPage'

const AutomateLandingPageContainer = () => {
    const hasAutomateFeature = useAppSelector(getHasAutomate)
    const hasLegacyAutomateFeatures = useAppSelector(
        getHasLegacyAutomateFeatures
    )

    const storeIntegrations = useStoreIntegrations()
    const hasAutomateOrLegacyAutomateFeatures =
        hasAutomateFeature || hasLegacyAutomateFeatures

    if (!hasAutomateOrLegacyAutomateFeatures) {
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
