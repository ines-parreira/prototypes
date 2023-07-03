import React from 'react'
import {Redirect} from 'react-router-dom'

import useAppSelector from 'hooks/useAppSelector'
import {getHasAutomationAddOn} from 'state/billing/selectors'

import TrackOrderFlowView from './TrackOrderFlowView'

export default function TrackOrderFlowViewContainer() {
    const hasAutomationAddOn = useAppSelector(getHasAutomationAddOn)

    if (!hasAutomationAddOn) {
        return <Redirect to="/app/automation/order-management" />
    }

    return <TrackOrderFlowView />
}
