// @flow

import {createSelector} from 'reselect'

import {getShopifyActionsState} from '../selectors'
import type {ShopifyActionsState} from '../types'

import type {DuplicateOrderState} from './types'

export const getDuplicateOrderState = createSelector(
    [getShopifyActionsState],
    (state: ShopifyActionsState): DuplicateOrderState => state.duplicateOrder,
)
