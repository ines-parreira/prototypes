import React from 'react'
import {useFlags} from 'launchdarkly-react-client-sdk'

import {FeatureFlagKey} from 'config/featureFlags'

const SelfServiceStatsPageTitle = () => {
    const isAutomationSettingsRevampEnabled: boolean | undefined =
        useFlags()[FeatureFlagKey.AutomationSettingsRevamp]

    return (
        <>
            {isAutomationSettingsRevampEnabled
                ? 'Automation Add-on'
                : 'Self-service'}
        </>
    )
}

export default SelfServiceStatsPageTitle
