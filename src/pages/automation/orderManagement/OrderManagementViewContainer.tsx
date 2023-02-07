import React from 'react'
import {Redirect} from 'react-router-dom'

import useAppSelector from 'hooks/useAppSelector'
import {
    getHasAutomationAddOn,
    getHasLegacyAutomationAddOnFeatures,
} from 'state/billing/selectors'

import OrderManagementView from './OrderManagementView'

const OrderManagementViewContainer = () => {
    const hasAutomationAddOn = useAppSelector(getHasAutomationAddOn)
    const hasLegacyAutomationAddOnFeatures = useAppSelector(
        getHasLegacyAutomationAddOnFeatures
    )

    if (!hasAutomationAddOn && !hasLegacyAutomationAddOnFeatures) {
        return <Redirect to="/app/automation/order-management" />
    }

    return <OrderManagementView />
}

export default OrderManagementViewContainer
