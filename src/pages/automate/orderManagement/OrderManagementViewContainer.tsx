import React from 'react'
import {Redirect} from 'react-router-dom'

import useAppSelector from 'hooks/useAppSelector'
import {
    getHasAutomate,
    getHasLegacyAutomateFeatures,
} from 'state/billing/selectors'

import OrderManagementView from './OrderManagementView'

const OrderManagementViewContainer = () => {
    const hasAutomate = useAppSelector(getHasAutomate)
    const hasLegacyAutomateFeatures = useAppSelector(
        getHasLegacyAutomateFeatures
    )

    if (!hasAutomate && !hasLegacyAutomateFeatures) {
        return <Redirect to="/app/automation/order-management" />
    }

    return <OrderManagementView />
}

export default OrderManagementViewContainer
