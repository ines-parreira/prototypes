// @flow

import {createSelector} from 'reselect'

import {getShopifyActionsState} from '../selectors'
import type {ShopifyActionsState} from '../types'

import type {CreateOrderState} from './types'

export const getCreateOrderState = createSelector(
    [getShopifyActionsState],
    (state: ShopifyActionsState): CreateOrderState => state.createOrder,
)
