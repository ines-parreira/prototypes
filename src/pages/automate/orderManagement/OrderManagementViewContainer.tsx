import { Redirect } from 'react-router-dom'

import useAppSelector from 'hooks/useAppSelector'
import { getHasAutomate } from 'state/billing/selectors'

import OrderManagementView from './OrderManagementView'

const OrderManagementViewContainer = () => {
    const hasAutomate = useAppSelector(getHasAutomate)

    if (!hasAutomate) {
        return <Redirect to="/app/automation/order-management" />
    }

    return <OrderManagementView />
}

export default OrderManagementViewContainer
