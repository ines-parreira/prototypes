import {createSelector} from 'reselect'

import {RootState} from 'state/types'
import {getBigCommerceActionsState} from 'state/infobarActions/bigcommerce/selectors'
import {BigCommerceActionsState} from 'state/infobarActions/bigcommerce/types'

import {toJS} from 'utils'
import {getIntegrationDataByIntegrationId} from 'state/ticket/selectors'
import {getActiveCustomerIntegrationDataByIntegrationId} from 'state/customers/selectors'
import {BigCommerceCustomerAddress} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/bigcommerce/types'
import {CreateOrderState} from './types'

export const getCreateOrderState = createSelector<
    RootState,
    CreateOrderState,
    BigCommerceActionsState
>(getBigCommerceActionsState, (state) => state.createOrder)

export const getCustomerAddresses = (integrationId: Maybe<number>) =>
    createSelector(
        (state: RootState) => state,
        (state: RootState) => {
            if (!integrationId) {
                return []
            }
            let data = getIntegrationDataByIntegrationId(integrationId)(state)
            if (!data || !data.size) {
                data =
                    getActiveCustomerIntegrationDataByIntegrationId(
                        integrationId
                    )(state)
            }
            if (data && data.size) {
                const email = data.getIn(['customer', 'email'])
                const addresses: BigCommerceCustomerAddress[] = toJS(
                    data.getIn(['customer', 'addresses'], [])
                )
                addresses.forEach((address: BigCommerceCustomerAddress) => {
                    address.email = email
                })
                return addresses
            }
            return []
        }
    )
