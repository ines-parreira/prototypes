import { createSelector } from 'reselect'

import { getShopifyActionsState } from '../selectors'

export const getEditOrderState = createSelector(
    getShopifyActionsState,
    (state) => state.editOrder,
)
