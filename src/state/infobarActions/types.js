// @flow

import {SHOPIFY_INTEGRATION_TYPE} from '../../constants/integration'

import type {ShopifyActionsState} from './shopify/types'

export type InfobarActionsState = {
    [SHOPIFY_INTEGRATION_TYPE]: ShopifyActionsState,
}
