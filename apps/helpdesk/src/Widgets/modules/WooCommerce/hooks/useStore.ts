import { useContext } from 'react'

import type { Map } from 'immutable'

import useAppSelector from 'hooks/useAppSelector'
import type { Customer } from 'models/customer/types'
import type { CustomerEcommerceData } from 'models/customerEcommerceData/types'
import type { EcommerceIntegrationMeta } from 'models/integration/types'
import { IntegrationContext } from 'providers/infobar/IntegrationContext'
import { getCustomersState } from 'state/customers/selectors'
import { getTicketState } from 'state/ticket/selectors'

export function useStore() {
    const { integration } = useContext(IntegrationContext)
    const customerState: Map<any, any> | undefined =
        useAppSelector(getCustomersState).get('active')
    const ticketState: Map<any, any> | undefined =
        useAppSelector(getTicketState).get('customer')
    const state: Customer | undefined = (
        customerState?.isEmpty() ? ticketState : customerState
    )?.toJS()
    if (!state || !integration) {
        return
    }
    const meta: Map<any, any> = integration.get('meta') as Map<any, any>
    if (!meta) {
        return
    }
    const integrationMeta: EcommerceIntegrationMeta = meta.toJS()
    const storeUUID: string = integrationMeta.store_uuid

    const ecommerceData = state.ecommerce_data
    if (!ecommerceData) {
        return
    }
    const data: CustomerEcommerceData = ecommerceData[storeUUID]
    if (data) {
        return data.store
    }
}
