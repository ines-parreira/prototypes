import { createSelector } from 'reselect'

import { getShopifyActionsState } from '../selectors'

export const getShippingAddressState = createSelector(
    getShopifyActionsState,
    (state) => state.editShippingAddress,
)
