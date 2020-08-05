import {CancelOrderState} from './cancelOrder/types'
import {CreateOrderState} from './createOrder/types'
import {RefundOrderState} from './refundOrder/types'

export type ShopifyActionsState = {
    cancelOrder: CancelOrderState
    createOrder: CreateOrderState
    refundOrder: RefundOrderState
}
