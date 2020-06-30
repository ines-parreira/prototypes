// @flow

import {createSelector} from 'reselect'

import {getShopifyActionsState} from '../selectors'
import type {ShopifyActionsState} from '../types'

import type {RefundOrderState} from './types'

export const getRefundOrderState = createSelector(
    [getShopifyActionsState],
    (state: ShopifyActionsState): RefundOrderState => state.refundOrder
)
