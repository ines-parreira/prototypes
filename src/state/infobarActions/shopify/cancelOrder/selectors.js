// @flow

import {createSelector} from 'reselect'

import {getShopifyActionsState} from '../selectors'
import type {ShopifyActionsState} from '../types'

import type {CancelOrderState} from './types'

export const getCancelOrderState = createSelector(
    [getShopifyActionsState],
    (state: ShopifyActionsState): CancelOrderState => state.cancelOrder,
)
