// @flow

import {createSelector} from 'reselect'

import {SHOPIFY_INTEGRATION_TYPE} from '../../../constants/integration'
import {getInfobarActionsState} from '../selectors'
import type {InfobarActionsState} from '../types'

import type {ShopifyActionsState} from './types'

export const getShopifyActionsState = createSelector(
    [getInfobarActionsState],
    (state: InfobarActionsState): ShopifyActionsState => state[SHOPIFY_INTEGRATION_TYPE],
)
