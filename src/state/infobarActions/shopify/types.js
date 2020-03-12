// @flow

import type {CancelOrderState} from './cancelOrder/types'
import type {DuplicateOrderState} from './duplicateOrder/types'

export type ShopifyActionsState = {
    cancelOrder: CancelOrderState,
    duplicateOrder: DuplicateOrderState,
}
