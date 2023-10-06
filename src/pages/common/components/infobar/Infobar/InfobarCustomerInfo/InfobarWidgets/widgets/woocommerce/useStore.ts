import {Map} from 'immutable'
import {useContext} from 'react'
import useAppSelector from 'hooks/useAppSelector'
import {IntegrationContext} from 'providers/infobar/IntegrationContext'
import {getCustomersState} from 'state/customers/selectors'
import {getTicketState} from 'state/ticket/selectors'

export function useStore() {
    const {integration} = useContext(IntegrationContext)
    const customerState: Map<any, any> =
        useAppSelector(getCustomersState).get('active')
    const ticketState: Map<any, any> =
        useAppSelector(getTicketState).get('customer')
    const state = customerState.size ? customerState : ticketState
    if (!integration) {
        return
    }
    const meta = integration.get('meta') as Map<any, any>
    if (!meta) {
        return
    }
    const storeUUID = meta.get('store_uuid')
    if (state) {
        const ecommerceData: Map<any, any> = state.get('ecommerce_data')
        const data: Map<any, any> = ecommerceData.get(storeUUID)
        if (data) {
            return data.get('store') as unknown
        }
    }
}
