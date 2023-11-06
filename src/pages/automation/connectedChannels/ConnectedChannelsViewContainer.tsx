import React from 'react'
import {Redirect} from 'react-router-dom'

import useAppSelector from 'hooks/useAppSelector'
import {
    getHasAutomationAddOn,
    getHasLegacyAutomationAddOnFeatures,
} from 'state/billing/selectors'

import ConnectedChannelsView from './ConnectedChannelsView'

const ConnectedChannelsViewContainer = () => {
    const hasAutomationAddOn = useAppSelector(getHasAutomationAddOn)
    const hasLegacyAutomationAddOnFeatures = useAppSelector(
        getHasLegacyAutomationAddOnFeatures
    )

    if (!hasAutomationAddOn && !hasLegacyAutomationAddOnFeatures) {
        return <Redirect to="/app/automation/connected-channels" />
    }

    return <ConnectedChannelsView />
}

export default ConnectedChannelsViewContainer
