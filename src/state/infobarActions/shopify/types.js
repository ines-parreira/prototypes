// @flow

import type {CancelOrderState} from './cancelOrder/types'
import type {DuplicateOrderState} from './duplicateOrder/types'
import type {RefundOrderState} from './refundOrder/types'

export type ShopifyActionsState = {
    cancelOrder: CancelOrderState,
    duplicateOrder: DuplicateOrderState,
    refundOrder: RefundOrderState,
}
