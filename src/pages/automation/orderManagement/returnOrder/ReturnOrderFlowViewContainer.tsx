import React from 'react'
import {Redirect} from 'react-router-dom'

import useAppSelector from 'hooks/useAppSelector'
import {
    getHasAutomationAddOn,
    getHasLegacyAutomationAddOnFeatures,
} from 'state/billing/selectors'

import ReturnOrderFlowView from './ReturnOrderFlowView'

const ReturnOrderFlowViewContainer = () => {
    const hasAutomationAddOn = useAppSelector(getHasAutomationAddOn)
    const hasLegacyAutomationAddOnFeatures = useAppSelector(
        getHasLegacyAutomationAddOnFeatures
    )

    if (!hasAutomationAddOn && !hasLegacyAutomationAddOnFeatures) {
        return <Redirect to="/app/automation/order-management" />
    }

    return <ReturnOrderFlowView />
}

export default ReturnOrderFlowViewContainer
