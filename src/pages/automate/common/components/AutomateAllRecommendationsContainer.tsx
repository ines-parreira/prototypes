import useAppSelector from 'hooks/useAppSelector'
import { ErrorBoundary } from 'pages/ErrorBoundary'
import { getHasAutomate } from 'state/billing/selectors'

import { AutomateFeatures } from '../types'
import AutomateAllRecommendationsPage from './AutomateAllRecommendationsPage'
import AutomatePaywallView from './AutomatePaywallView'

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
