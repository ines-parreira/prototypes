import {fromJS, Map as ImmutableMap, List} from 'immutable'

import {IntegrationType} from '../models/integration/types'
import {initialState as createOrderInitialState} from '../state/infobarActions/shopify/createOrder/reducers'
import {initialState as cancelOrderInitialState} from '../state/infobarActions/shopify/cancelOrder/reducers'
import {initialState as refundOrderInitialState} from '../state/infobarActions/shopify/refundOrder/reducers'
import {initialState as editOrderInitialState} from '../state/infobarActions/shopify/editOrder/reducers'
import {initialState as shippingAddressInitialState} from '../state/infobarActions/shopify/editShippingAddress/reducers'
import {CreateOrderState} from '../state/infobarActions/shopify/createOrder/types'
import {CancelOrderState} from '../state/infobarActions/shopify/cancelOrder/types'
import {RefundOrderState} from '../state/infobarActions/shopify/refundOrder/types'
import {InfobarActionsState} from '../state/infobarActions/types'

export const infobarActionsStateFixture = ({
    cancelOrderState = cancelOrderInitialState,
    createOrderState = createOrderInitialState,
    refundOrderState = refundOrderInitialState,
    editOrderState = editOrderInitialState,
    editShippingAddressState = shippingAddressInitialState,
}: {
    cancelOrderState?: typeof cancelOrderInitialState
    createOrderState?: typeof createOrderInitialState
    refundOrderState?: typeof refundOrderInitialState
    editOrderState?: typeof editOrderInitialState
    editShippingAddressState?: typeof shippingAddressInitialState
} = {}): InfobarActionsState => ({
    [IntegrationType.ShopifyIntegrationType]: {
        cancelOrder: cancelOrderState,
        createOrder: createOrderState,
        refundOrder: refundOrderState,
        editOrder: editOrderState,
        editShippingAddress: editShippingAddressState,
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
