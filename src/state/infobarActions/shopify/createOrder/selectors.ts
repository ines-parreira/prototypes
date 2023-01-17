import {createSelector} from 'reselect'

import {getShopifyActionsState} from '../selectors'

export const getCreateOrderState = createSelector(
    getShopifyActionsState,
    (state) => state.createOrder
)
