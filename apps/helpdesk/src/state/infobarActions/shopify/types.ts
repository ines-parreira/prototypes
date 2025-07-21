import { CancelOrderState } from './cancelOrder/types'
import { CreateOrderState } from './createOrder/types'
import { EditOrderState } from './editOrder/types'
import { EditShippingAddressState } from './editShippingAddress/types'
import { RefundOrderState } from './refundOrder/types'

export type ShopifyActionsState = {
    cancelOrder: CancelOrderState
    createOrder: CreateOrderState
    refundOrder: RefundOrderState
    editOrder: EditOrderState
    editShippingAddress: EditShippingAddressState
}
