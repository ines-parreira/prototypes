import React from 'react'
import {AutomateFeatures} from 'pages/automate/common/types'
import {getHasAutomate} from 'state/billing/selectors'
import useAppSelector from 'hooks/useAppSelector'
import AutomatePaywallView from '../automate/common/components/AutomatePaywallView'
import AutomateOverview from './AutomateOverview'

const AutomateStatsPaywall: React.FC = () => {
    const hasAutomate = useAppSelector(getHasAutomate)

    return !hasAutomate ? (
        <AutomatePaywallView automateFeature={AutomateFeatures.AutomateStats} />
    ) : (
        <AutomateOverview />
    )
}

export default AutomateStatsPaywall
