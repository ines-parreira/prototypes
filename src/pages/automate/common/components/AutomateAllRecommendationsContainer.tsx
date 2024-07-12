import React from 'react'
import {ErrorBoundary} from 'pages/ErrorBoundary'
import useAppSelector from 'hooks/useAppSelector'
import {
    getHasAutomate,
    getHasLegacyAutomateFeatures,
} from 'state/billing/selectors'
import {AutomateFeatures} from '../types'
import AutomateAllRecommendationsView from './AutomateAllRecommendationsView'
import AutomatePaywallView from './AutomatePaywallView'

const AutomateAllRecommendationsContainer = () => {
    const hasAutomateFeature = useAppSelector(getHasAutomate)
    const hasLegacyAutomateFeatures = useAppSelector(
        getHasLegacyAutomateFeatures
    )
    const hasAutomateOrLegacyAutomateFeatures =
        hasAutomateFeature || hasLegacyAutomateFeatures

    if (!hasAutomateOrLegacyAutomateFeatures) {
        return (
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
            <AutomateAllRecommendationsView />
        </ErrorBoundary>
    )
}

export default AutomateAllRecommendationsContainer
