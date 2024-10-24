import React from 'react'

import useAppSelector from 'hooks/useAppSelector'
import {AutomateFeatures} from 'pages/automate/common/types'
import {ErrorBoundary} from 'pages/ErrorBoundary'
import {getHasAutomate} from 'state/billing/selectors'

import AutomatePaywallView from '../automate/common/components/AutomatePaywallView'
import {AutomateOverview} from './AutomateOverview'

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
