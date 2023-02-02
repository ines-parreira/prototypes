import React from 'react'
import {useFlags} from 'launchdarkly-react-client-sdk'

import {FeatureFlagKey} from 'config/featureFlags'

const SelfServiceStatsPageDescription = () => {
    const isAutomationSettingsRevampEnabled: boolean | undefined =
        useFlags()[FeatureFlagKey.AutomationSettingsRevamp]

    return isAutomationSettingsRevampEnabled ? (
        <>
            This page provides an overview of the performance of features
            included in the Automation Add-on. This view shows data from chat
            and help center channels combined.
        </>
    ) : (
        <>
            Self-service statistics give you an overview of the performance of
            your self-service features which can automate tickets and save you
            time. This view shows data from{' '}
            <b>chat and help centers combined</b>.
        </>
    )
}

export default SelfServiceStatsPageDescription
