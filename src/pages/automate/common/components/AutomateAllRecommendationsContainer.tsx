import React from 'react'
import {ErrorBoundary} from 'pages/ErrorBoundary'
import useAppSelector from 'hooks/useAppSelector'
import {getHasAutomate} from 'state/billing/selectors'
import {AutomateFeatures} from '../types'
import AutomatePaywallView from './AutomatePaywallView'
import AutomateAllRecommendationsPage from './AutomateAllRecommendationsPage'

const AutomateAllRecommendationsContainer = () => {
    const hasAutomateFeature = useAppSelector(getHasAutomate)

    if (!hasAutomateFeature) {
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
            <AutomateAllRecommendationsPage />
        </ErrorBoundary>
    )
}

export default AutomateAllRecommendationsContainer
