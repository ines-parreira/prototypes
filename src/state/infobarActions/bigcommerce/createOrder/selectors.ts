import {createSelector} from 'reselect'

import {RootState} from 'state/types'

import {toJS} from 'utils'
import {getIntegrationDataByIntegrationId} from 'state/ticket/selectors'
import {getActiveCustomerIntegrationDataByIntegrationId} from 'state/customers/selectors'
import {BigCommerceCustomerAddress} from 'models/integration/types'

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
