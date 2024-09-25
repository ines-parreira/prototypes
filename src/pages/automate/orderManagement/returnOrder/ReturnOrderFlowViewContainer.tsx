import React from 'react'
import {Redirect} from 'react-router-dom'

import useAppSelector from 'hooks/useAppSelector'
import {getHasAutomate} from 'state/billing/selectors'

import ReturnOrderFlowView from './ReturnOrderFlowView'

const ReturnOrderFlowViewContainer = () => {
    const hasAutomate = useAppSelector(getHasAutomate)

    if (!hasAutomate) {
        return <Redirect to="/app/automation/order-management" />
    }

    return <ReturnOrderFlowView />
}

export default ReturnOrderFlowViewContainer
