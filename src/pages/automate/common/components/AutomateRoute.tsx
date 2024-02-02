import React from 'react'
import {Redirect} from 'react-router-dom'
import {useFlags} from 'launchdarkly-react-client-sdk'
import useAppSelector from 'hooks/useAppSelector'

import {
    getHasAutomate,
    getHasLegacyAutomateFeatures,
} from 'state/billing/selectors'
import {FeatureFlagKey} from 'config/featureFlags'
import {compare} from 'utils'
import {getShopNameFromStoreIntegration} from 'models/selfServiceConfiguration/utils'
import {ErrorBoundary} from 'pages/ErrorBoundary'
import {AutomateFeatures} from '../types'
import useStoreIntegrations from '../hooks/useStoreIntegrations'

import StoreIntegrationView from './StoreIntegrationView'
import AutomatePaywallView from './AutomatePaywallView'

import AutomateLandingPage from './AutomateLandingPage'

const AutomateRoute = () => {
    const hasAutomateFeature = useAppSelector(getHasAutomate)
    const hasLegacyAutomateFeatures = useAppSelector(
        getHasLegacyAutomateFeatures
    )

    const storeIntegrations = useStoreIntegrations()
    const hasAutomateOrLegacyAutomateFeatures =
        hasAutomateFeature || hasLegacyAutomateFeatures

    const isNewLandingPageVisible: boolean | undefined =
        useFlags()[FeatureFlagKey.AutomateLandingPage]

    if (!hasAutomateOrLegacyAutomateFeatures) {
        return (
            <AutomatePaywallView automateFeature={AutomateFeatures.Automate} />
        )
    }

    if (!storeIntegrations.length) {
        return <StoreIntegrationView title={AutomateFeatures.Automate} />
    }

    if (isNewLandingPageVisible) {
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

    const sortedStoreIntegrations = [...storeIntegrations].sort((a, b) =>
        compare(a.name, b.name)
    )
    const shopType = sortedStoreIntegrations[0].type
    const shopName = getShopNameFromStoreIntegration(sortedStoreIntegrations[0])

    if (isNewLandingPageVisible !== undefined) {
        return <Redirect to={`/app/automation/${shopType}/${shopName}/flows`} />
    }

    return null
}
export default AutomateRoute
