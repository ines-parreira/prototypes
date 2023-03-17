import React from 'react'
import {Redirect} from 'react-router-dom'

import useAppSelector from 'hooks/useAppSelector'
import {getHasAutomationAddOn} from 'state/billing/selectors'

import ConnectedChannelsView from './ConnectedChannelsView'

const ConnectedChannelsViewContainer = () => {
    const hasAutomationAddOn = useAppSelector(getHasAutomationAddOn)

    if (!hasAutomationAddOn) {
        return <Redirect to="/app/automation/macros" />
    }

    return <ConnectedChannelsView />
}

export default ConnectedChannelsViewContainer
