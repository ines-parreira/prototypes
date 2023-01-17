import {createSelector} from 'reselect'

import {getShopifyActionsState} from '../selectors'

export const getCancelOrderState = createSelector(
    getShopifyActionsState,
    (state) => state.cancelOrder
)
