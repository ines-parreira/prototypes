import React from 'react'

import useAppSelector from 'hooks/useAppSelector'
import AutomatePaywallView from 'pages/automate/common/components/AutomatePaywallView'
import { AutomateFeatures } from 'pages/automate/common/types'
import { ErrorBoundary } from 'pages/ErrorBoundary'
import { AutomateOverview } from 'pages/stats/automate/overview/AutomateOverview'
import { getHasAutomate } from 'state/billing/selectors'

const AutomateStatsPaywall: React.FC = () => {
    const hasAutomate = useAppSelector(getHasAutomate)

    return (
        <ErrorBoundary
            sentryTags={{
                section: 'automate-stats',
                team: 'automate-obs',
            }}
        >
            {!hasAutomate ? (
                <AutomatePaywallView
                    automateFeature={AutomateFeatures.AutomateStats}
                />
            ) : (
                <AutomateOverview />
            )}
        </ErrorBoundary>
    )
}

export default AutomateStatsPaywall
