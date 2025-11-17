import type { CancelOrderState } from './cancelOrder/types'
import type { CreateOrderState } from './createOrder/types'
import type { EditOrderState } from './editOrder/types'
import type { EditShippingAddressState } from './editShippingAddress/types'
import type { RefundOrderState } from './refundOrder/types'

export type ShopifyActionsState = {
    cancelOrder: CancelOrderState
    createOrder: CreateOrderState
    refundOrder: RefundOrderState
    editOrder: EditOrderState
    editShippingAddress: EditShippingAddressState
}
