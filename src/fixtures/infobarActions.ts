import {fromJS, Map as ImmutableMap, List} from 'immutable'

import {IntegrationType} from '../models/integration/types'
import {initialState as shopifyCreateOrderInitialState} from '../state/infobarActions/shopify/createOrder/reducers'
import {initialState as cancelOrderInitialState} from '../state/infobarActions/shopify/cancelOrder/reducers'
import {initialState as refundOrderInitialState} from '../state/infobarActions/shopify/refundOrder/reducers'
import {initialState as editOrderInitialState} from '../state/infobarActions/shopify/editOrder/reducers'
import {initialState as shippingAddressInitialState} from '../state/infobarActions/shopify/editShippingAddress/reducers'
import {initialState as bigcommerceCreateOrderInitialState} from '../state/infobarActions/bigcommerce/createOrder/reducers'
import {CreateOrderState} from '../state/infobarActions/shopify/createOrder/types'
import {CancelOrderState} from '../state/infobarActions/shopify/cancelOrder/types'
import {RefundOrderState} from '../state/infobarActions/shopify/refundOrder/types'
import {InfobarActionsState} from '../state/infobarActions/types'

export const infobarActionsStateFixture = ({
    cancelOrderState = cancelOrderInitialState,
    shopifyCreateOrderState = shopifyCreateOrderInitialState,
    refundOrderState = refundOrderInitialState,
    editOrderState = editOrderInitialState,
    editShippingAddressState = shippingAddressInitialState,
    bigcommerceCreateOrderState = bigcommerceCreateOrderInitialState,
}: {
    cancelOrderState?: typeof cancelOrderInitialState
    shopifyCreateOrderState?: typeof shopifyCreateOrderInitialState
    refundOrderState?: typeof refundOrderInitialState
    editOrderState?: typeof editOrderInitialState
    editShippingAddressState?: typeof shippingAddressInitialState
    bigcommerceCreateOrderState?: typeof bigcommerceCreateOrderInitialState
} = {}): InfobarActionsState => ({
    [IntegrationType.Shopify]: {
        cancelOrder: cancelOrderState,
        createOrder: shopifyCreateOrderState,
        refundOrder: refundOrderState,
        editOrder: editOrderState,
        editShippingAddress: editShippingAddressState,
    },
    [IntegrationType.BigCommerce]: {
        createOrder: bigcommerceCreateOrderState,
    },
})

export const createOrderStateFixture = ({
    loading = false,
    loadingMessage = null,
    payload = null,
    calculatedDraftOrder = null,
    products = new Map(),
}: Record<string, any> = {}) =>
    fromJS({
        loading,
        loadingMessage,
        payload,
        calculatedDraftOrder,
        products,
    }) as CreateOrderState

export const cancelOrderStateFixture = ({
    loading = false,
    loadingMessage = null,
    orderId = null,
    payload = null,
    lineItems = null,
    refund = null,
} = {}) =>
    fromJS({
        loading,
        loadingMessage,
        orderId,
        payload,
        lineItems,
        refund,
    }) as CancelOrderState

export const refundOrderStateFixture = ({
    loading = false,
    loadingMessage = null,
    orderId = null,
    payload = null,
    lineItems = null,
    refund = null,
}: {
    loading?: boolean
    loadingMessage?: string | null
    orderId?: string | null
    payload?: ImmutableMap<any, any> | null
    lineItems?: List<any> | null
    refund?: ImmutableMap<any, any> | null
} = {}) =>
    fromJS({
        loading,
        loadingMessage,
        orderId,
        payload,
        lineItems,
        refund,
    }) as RefundOrderState
