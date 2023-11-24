import React from 'react'
import {useFlags} from 'launchdarkly-react-client-sdk'
import {useIsAutomateRebranding} from 'pages/automate/common/hooks/useIsAutomateRebranding'
import {AutomateFeatures} from 'pages/automate/common/types'
import {getHasAutomate} from 'state/billing/selectors'
import useAppSelector from 'hooks/useAppSelector'
import {FeatureFlagKey} from 'config/featureFlags'
import AutomatePaywallView from '../automate/common/components/AutomatePaywallView'
import AutomateOverview from './AutomateOverview'
import SelfServiceStatsPage from './self-service/SelfServiceStatsPage'

const AutomateStatsPaywall: React.FC = () => {
    const isNewAutomateEnabled: boolean | undefined =
        useFlags()[FeatureFlagKey.NewAutomationAddon]
    const {isAutomateRebranding} = useIsAutomateRebranding()
    const hasAutomate = useAppSelector(getHasAutomate)

    return isAutomateRebranding && !hasAutomate ? (
        <AutomatePaywallView automateFeature={AutomateFeatures.AutomateStats} />
    ) : isNewAutomateEnabled ? (
        <AutomateOverview />
    ) : (
        <SelfServiceStatsPage />
    )
}

export default AutomateStatsPaywall
