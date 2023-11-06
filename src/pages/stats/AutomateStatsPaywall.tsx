import React from 'react'
import {useFlags} from 'launchdarkly-react-client-sdk'
import {useIsAutomateRebranding} from 'pages/automation/common/hooks/useIsAutomateRebranding'
import {AutomateFeatures} from 'pages/automation/common/types'
import {getHasAutomationAddOn} from 'state/billing/selectors'
import useAppSelector from 'hooks/useAppSelector'
import {FeatureFlagKey} from 'config/featureFlags'
import AutomatePaywallView from '../automation/common/components/AutomatePaywallView'
import AutomateOverview from './AutomateOverview'
import SelfServiceStatsPage from './self-service/SelfServiceStatsPage'

const AutomateStatsPaywall: React.FC = () => {
    const isNewAutomationAddonEnabled: boolean | undefined =
        useFlags()[FeatureFlagKey.NewAutomationAddon]
    const {isAutomateRebranding} = useIsAutomateRebranding()
    const hasAutomationAddOn = useAppSelector(getHasAutomationAddOn)

    return isAutomateRebranding && !hasAutomationAddOn ? (
        <AutomatePaywallView automateFeature={AutomateFeatures.AutomateStats} />
    ) : isNewAutomationAddonEnabled ? (
        <AutomateOverview />
    ) : (
        <SelfServiceStatsPage />
    )
}

export default AutomateStatsPaywall
