import {createSelector} from 'reselect'

import {RootState} from '../../../types'
import {getShopifyActionsState} from '../selectors'
import {ShopifyActionsState} from '../types'

import {RefundOrderState} from './types'

export const getRefundOrderState = createSelector<
    RootState,
    RefundOrderState,
    ShopifyActionsState
>(getShopifyActionsState, (state) => state.refundOrder)
