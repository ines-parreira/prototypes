import React from 'react'

import { Redirect } from 'react-router-dom'

import useAppSelector from 'hooks/useAppSelector'
import { getHasAutomate } from 'state/billing/selectors'

import TrackOrderFlowView from './TrackOrderFlowView'

export default function TrackOrderFlowViewContainer() {
    const hasAutomate = useAppSelector(getHasAutomate)

    if (!hasAutomate) {
        return <Redirect to="/app/automation/order-management" />
    }

    return <TrackOrderFlowView />
}
