import { createSelector } from 'reselect'

import type { BigCommerceCustomerAddress } from 'models/integration/types'
import { getActiveCustomerIntegrationDataByIntegrationId } from 'state/customers/selectors'
import { getIntegrationDataByIntegrationId } from 'state/ticket/selectors'
import type { RootState } from 'state/types'
import { toJS } from 'utils'

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
                        integrationId,
                    )(state)
            }
            if (data && data.size) {
                const email = data.getIn(['customer', 'email'])
                let addresses: BigCommerceCustomerAddress[] = toJS(
                    data.getIn(['customer', 'addresses'], []),
                )
                addresses.forEach((address: BigCommerceCustomerAddress) => {
                    address.email = email
                })
                addresses = addresses.filter(
                    (addr) => addr.email && addr.country_code,
                )
                return addresses
            }
            return []
        },
    )
