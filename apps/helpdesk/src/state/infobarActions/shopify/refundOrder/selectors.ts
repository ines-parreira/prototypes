import { createSelector } from 'reselect'

import { getShopifyActionsState } from '../selectors'

export const getRefundOrderState = createSelector(
    getShopifyActionsState,
    (state) => state.refundOrder,
)
