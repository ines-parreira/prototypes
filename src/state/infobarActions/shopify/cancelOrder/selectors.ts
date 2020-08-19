import {createSelector} from 'reselect'

import {RootState} from '../../../types'
import {getShopifyActionsState} from '../selectors'
import {ShopifyActionsState} from '../types'

import {CancelOrderState} from './types'

export const getCancelOrderState = createSelector<
    RootState,
    CancelOrderState,
    ShopifyActionsState
>(getShopifyActionsState, (state) => state.cancelOrder)
